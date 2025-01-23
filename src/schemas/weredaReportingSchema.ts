import { z } from "zod"

export const amharicWeredaReportSchema = z.object({
  name: z.string().min(1, "እባክዎን የሪፖርት ስም ማስገባት ያስፈልጋል").max(100, "የሪፖርት ስም ከ100 ፊደላት መብለጥ የለበትም"),
  description: z.string().min(10, "የሪፖርት ማብራሪያ ቢያንስ 10 ፊደላት መሆን አለበት").max(1000, "የሪፖርት ማብራሪያ ከ1000 ፊደላት መብለጥ የለበትም"),
  images: z
    .array(z.instanceof(File))
    .max(5, "እባክዎን ከ5 ምስሎች በላይ ማስገባት አይችሉም")
    .optional()
    .refine((files) => files?.every((file) => file.size <= 5 * 1024 * 1024), "እያንዳንዱ ምስል ከ5MB መብለጥ የለበትም"),
  pdfs: z
    .array(z.instanceof(File))
    .max(2, "እባክዎን ከ2 PDF ፋይሎች በላይ ማስገባት አይችሉም")
    .optional()
    .refine((files) => files?.every((file) => file.size <= 10 * 1024 * 1024), "እያንዳንዱ PDF ከ10MB መብለጥ የለበትም"),
  audio: z
    .instanceof(File)
    .optional()
    .refine((file) => (file ? file.size <= 20 * 1024 * 1024 : true), "የድምጽ ፋይሉ ከ20MB መብለጥ የለበትም"),
  video: z
    .instanceof(File)
    .optional()
    .refine((file) => (file ? file.size <= 50 * 1024 * 1024 : true), "የቪዲዮ ፋይሉ ከ50MB መብለጥ የለበትም"),
})

export type AmharicWeredaReportFormData = z.infer<typeof amharicWeredaReportSchema>

