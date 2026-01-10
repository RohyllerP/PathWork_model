import { PDFDocument } from 'pdf-lib'

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)

  if (!formData) {
    throw createError({ statusCode: 400, statusMessage: 'No files' })
  }

  const files = formData.filter(f => f.name === 'files' && f.data)

  if (!files.length) {
    throw createError({ statusCode: 400, statusMessage: 'No PDF files provided' })
  }

  const mergedPdf = await PDFDocument.create()

  for (const file of files) {
    const pdf = await PDFDocument.load(file.data)
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
    pages.forEach(p => mergedPdf.addPage(p))
  }

  const pdfBytes = await mergedPdf.save()

  setHeader(event, 'Content-Type', 'application/pdf')
  setHeader(event, 'Content-Disposition', 'inline; filename="merged.pdf"')

  return pdfBytes
})
