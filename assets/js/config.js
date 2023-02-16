export const MaxCanvasWidth = 1200;

const this_hostname = `${location.protocol}//${location.hostname}`
const OCR_PORT = '8010'

const OCR_URL = `${this_hostname}:${OCR_PORT}`

export const URL_OCR_API_AvailableModels = `${OCR_URL}/available_models`
export const URL_OCR_API_AvailableLanguages = `${OCR_URL}/available_language`
export const URL_OCR_API_OCR = `${OCR_URL}/ocr`
