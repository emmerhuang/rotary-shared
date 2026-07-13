import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// @testing-library/react 需要每個 test 後 cleanup，避免同檔多次 render 累積於 DOM。
afterEach(() => cleanup())
