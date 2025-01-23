import { z } from "zod"

export const meseretawiRegistrationSchema = z.object({
  firstName: z.string().min(2, "ስም ቢያንስ 2 ፊደላት መሆን አለበት").max(50, "ስም ከ50 ፊደላት መብለጥ የለበትም"),
  lastName: z.string().min(2, "የአባት ስም ቢያንስ 2 ፊደላት መሆን አለበት").max(50, "የአባት ስም ከ50 ፊደላት መብለጥ የለበትም"),
  email: z.string().email("ትክክለኛ የኢሜይል አድራሻ ያስገቡ"),
  phone: z.string().regex(/^\+?[0-9]{10,14}$/, "ትክክለኛ ስልክ ቁጥር ያስገቡ። ምሳሌ፡ +251912345678"),
  userName: z.string().min(4, "የተጠቃሚ ስም ቢያንስ 4 ፊደላት መሆን አለበት").max(20, "የተጠቃሚ ስም ከ20 ፊደላት መብለጥ የለበትም"),
  password: z.string()
    .min(8, "የይለፍ ቃል ቢያንስ 8 ፊደላት መሆን አለበት")
    .regex(/[A-Z]/, "የይለፍ ቃል ቢያንስ አንድ ከፍተኛ ፊደል መያዝ አለበት")
    .regex(/[a-z]/, "የይለፍ ቃል ቢያንስ አንድ ትንሽ ፊደል መያዝ አለበት")
    .regex(/[0-9]/, "የይለፍ ቃል ቢያንስ አንድ ቁጥር መያዝ አለበት")
    .regex(/[^A-Za-z0-9]/, "የይለፍ ቃል ቢያንስ አንድ ልዩ ምልክት መያዝ አለበት"),
})

export type MeseretawiRegistrationFormData = z.infer<typeof meseretawiRegistrationSchema>
