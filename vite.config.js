import { defineConfig } from "vite"
import basicSsl from '@vitejs/plugin-basic-ssl'
import { resolve } from "node:path"

export default defineConfig({
    plugins: [basicSsl()],
    build: {
        rolldownOptions: {
            input: {
                main: resolve(import.meta.dirname, "index.html"),
                background: resolve(import.meta.dirname, "background.html"),
                serial: resolve(import.meta.dirname, "serial.html"),
            },
        },
    },
})
