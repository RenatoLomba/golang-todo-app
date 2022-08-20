import { FC, useState } from "react"
import axios, { AxiosError } from "axios"

import { 
  Box, 
  Button, 
  Group, 
  List, 
  Modal, 
  Textarea, 
  TextInput,
  ThemeIcon
} from "@mantine/core"
import { useForm } from '@mantine/form'
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CheckCircleFillIcon, CheckCircleIcon } from "@primer/octicons-react"

type Todo = {
  id: number
  title: string
  description: string
  done: boolean
}

type FormFields = {
  title: string
  description: string
}

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
})

function AddTodo() {
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)

  const { mutate: createTodo } = useMutation(async (data: FormFields) => {
    return (await api.post<Todo>('/todos', data)).data
  }, {
    onSuccess: (createdTodo) => {
      queryClient.setQueryData<Todo[]>(['todos'], (todos = []) => {
        return [...todos, createdTodo]
      })

      form.reset()
      setIsOpen(false)
    }
  })

  const form = useForm<FormFields>({
    initialValues: {
      title: '',
      description: ''
    }
  })

  function handleSubmit(values: FormFields) {
    createTodo(values)
  }

  return (
    <>
      <Modal 
        opened={isOpen} 
        onClose={() => setIsOpen(false)} 
        title="Create Todo"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput 
            required 
            mb={12} 
            label="Todo" 
            placeholder="What do you want to do?"
            {...form.getInputProps('title')}
          />

          <Textarea 
            required 
            mb={12} 
            label="Description" 
            placeholder="Tell me more..."
            {...form.getInputProps('description')}
          />

          <Button type="submit">Create todo</Button>
        </form>
      </Modal>

      <Group position="center">
        <Button fullWidth mb={12} onClick={() => setIsOpen(true)}>ADD TODO</Button>
      </Group>
    </>
  )
}

export const Todos: FC = () => {
  const queryClient = useQueryClient()

  const todos = 
    useQuery<Todo[], AxiosError>(['todos'],
      async () => {
        return (await api.get<Todo[]>('/todos')).data
      },
      {
        staleTime: Infinity
      }
    )

  const { mutate: markAsDone } = useMutation(async (id: number) => {
    return (await api.patch(`/todos/${id}/done`)).data
  }, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    }
  })

  if(todos.isLoading) return <Box >Loading...</Box>
  if(todos.isError) return <Box>{todos.error.message}</Box>

  function handleTodoClick(todoId: number) {
    markAsDone(todoId)
  }
  
  return (
    <Box>
      <List spacing="xs" size="sm" mb={12} center>
        {todos.data?.map((todo) => (
          <List.Item 
            onClick={() => !todo.done && handleTodoClick(todo.id)}
            sx={{ cursor: 'pointer', width: 'fit-content' }}
            key={`todo__${todo.id}`}
            icon={todo.done ? 
            (
              <ThemeIcon color="teal" size={24} radius="xl">
                <CheckCircleFillIcon size={20} />
              </ThemeIcon>
            ) : 
            (
              <ThemeIcon color="gray" size={24} radius="xl">
                <CheckCircleFillIcon size={20} />
              </ThemeIcon>
            )}
          >
            {todo.title}
          </List.Item>
        ))}
      </List>

      <AddTodo />
    </Box>
  )
}