import { z } from "zod"

export const amharicReportSchema = z.object({
  name: z.string().min(1, "እባክዎን የሪፖርት ስም ማስገባት አለብዎት").max(100, "እባክዎን የሪፖርት ስም ከ100 ፊደላት መብለጥ የለበትም"),
  description: z
    .string()
    .min(10, "እባክዎን የሪፖርት ማብራሪያ ቢያንስ 10 ፊደላት መሆን አለበት")
    .max(1000, "እባክዎን የሪፖርት ማብራሪያ ከ1000 ፊደላት መብለጥ የለበትም"),
  month: z.string().min(1, "እባክዎን የስብሰባው ወር ማስገባት አለብዎት").max(20, "እባክዎን የወር ስም ከ20 ፊደላት መብለጥ የለበትም"),
  presentEmployees: z
    .string()
    .min(0, "እባክዎን ከ0 በላይ ቁጥር ያስገቡ")
    .max(1000000, "እባክዎን ከ1,000,000 በታች ቁጥር ያስገቡ"),
  absentEmployees: z
    .string()
    .min(0, "እባክዎን ከ0 በላይ ቁጥር ያስገቡ")
    .max(1000000, "እባክዎን ከ1,000,000 በታች ቁጥር ያስገቡ"),
  images: z
    .array(z.instanceof(File))
    .max(5, "እባክዎን ከ5 ምስሎች በላይ ማስገባት አይችሉም")
    .optional()
    .refine((files) => files?.every((file) => file.size <= 5 * 1024 * 1024), "እባክዎን እያንዳንዱ ምስል ከ5MB መብለጥ የለበትም"),
  pdfs: z
    .array(z.instanceof(File))
    .max(2, "እባክዎን ከ2 PDF ፋይሎች በላይ ማስገባት አይችሉም")
    .optional()
    .refine((files) => files?.every((file) => file.size <= 10 * 1024 * 1024), "እባክዎን እያንዳንዱ PDF ከ10MB መብለጥ የለበትም"),
  audio: z
    .instanceof(File)
    .optional()
    .refine((file) => (file ? file.size <= 20 * 1024 * 1024 : true), "እባክዎን የድምጽ ፋይሉ ከ20MB መብለጥ የለበትም"),
  video: z
    .instanceof(File)
    .optional()
    .refine((file) => (file ? file.size <= 50 * 1024 * 1024 : true), "እባክዎን የቪዲዮ ፋይሉ ከ50MB መብለጥ የለበትም"),
})

export type AmharicReportFormData = z.infer<typeof amharicReportSchema>

