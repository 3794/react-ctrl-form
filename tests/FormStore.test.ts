import { expect, test, describe } from 'vitest'
import { createForm, createField, updateFieldValue, required, emailPattern } from '../src'

describe('Form Store', () => {
  describe('initialization', () => {
    test('should create form with initial values', () => {
      type LoginForm = { username: string; password: string }
      const store = createForm<LoginForm>({ username: '', password: '' })
      const state = store.getState()
      expect(state.username.value).toBe('')
      expect(state.password.value).toBe('')
    })

    test('should have no errors on creation', () => {
      type LoginForm = { username: string; password: string }
      const store = createForm<LoginForm>({ username: '', password: '' })
      const state = store.getState()
      expect(state.username.error).toBeUndefined()
      expect(state.password.error).toBeUndefined()
    })
  })

  describe('field validation', () => {
    test('should set error when required field is empty', async () => {
      type LoginForm = { username: string }
      const store = createForm<LoginForm>({ username: '' })

      const usernameField = createField<LoginForm>({
        select: (s) => s.username,
        validate: required('Username is required'),
      })

      updateFieldValue(store, usernameField, '')

      // Wait for async validation
      await new Promise(resolve => setTimeout(resolve, 50))

      const state = store.getState()
      expect(state.username.error).toBe('Username is required')
    })

    test('should clear error when required field has value', async () => {
      type LoginForm = { username: string }
      const store = createForm<LoginForm>({ username: '' })

      const usernameField = createField<LoginForm>({
        select: (s) => s.username,
        validate: required('Username is required'),
      })

      updateFieldValue(store, usernameField, 'john')

      // Wait for async validation
      await new Promise(resolve => setTimeout(resolve, 50))

      const state = store.getState()
      expect(state.username.error).toBeUndefined()
      expect(state.username.value).toBe('john')
    })
  })

  describe('updateFieldValue', () => {
    test('should update field value and run validation', async () => {
      type LoginForm = { email: string }
      const store = createForm<LoginForm>({ email: '' })

      const emailField = createField<LoginForm>({
        select: (s) => s.email,
        validate: emailPattern('Invalid email'),
      })

      updateFieldValue(store, emailField, 'invalid-email')

      // Wait for async validation
      await new Promise(resolve => setTimeout(resolve, 50))

      const state = store.getState()
      expect(state.email.value).toBe('invalid-email')
      expect(state.email.error).toBe('Invalid email')
    })

    test('should immediately set value before validation completes', () => {
      type LoginForm = { username: string }
      const store = createForm<LoginForm>({ username: '' })

      const usernameField = createField<LoginForm>({
        select: (s) => s.username,
        validate: required('Username is required'),
      })

      updateFieldValue(store, usernameField, 'john')

      // Value should be set immediately, not waiting for validation
      const state = store.getState()
      expect(state.username.value).toBe('john')
    })
  })

  describe('store subscription', () => {
    test('should notify listeners on state change', () => {
      type LoginForm = { username: string }
      const store = createForm<LoginForm>({ username: '' })
      let notified = false

      store.subscribe(() => {
        notified = true
      })

      const usernameField = createField<LoginForm>({
        select: (s) => s.username,
      })

      updateFieldValue(store, usernameField, 'john')

      expect(notified).toBe(true)
    })
  })
})
