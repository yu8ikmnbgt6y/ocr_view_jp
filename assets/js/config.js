export const MaxCanvasWidth = 1200;

const PROTOCOL = 'http'
const OCR_HOST = 'localhost'
const OCR_PORT = '8080'

const OCR_URL = `${PROTOCOL}://${OCR_HOST}:${OCR_PORT}`

export const URL_OCR_API_AvailableModels = `${OCR_URL}/available_models`
export const URL_OCR_API_AvailableLanguages = `${OCR_URL}/available_language`
export const URL_OCR_API_OCR = `${OCR_URL}/ocr`