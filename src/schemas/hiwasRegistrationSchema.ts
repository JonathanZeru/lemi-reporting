import { z } from "zod"

export const hiwasRegistrationSchema = z.object({
  firstName: z
    .string()
    .min(2, "እባክዎን ስምዎ ቢያንስ 2 ፊደላት መሆን አለበት")
    .max(50, "እባክዎን ስምዎ ከ50 ፊደላት መብለጥ የለበትም"),
  lastName: z
    .string()
    .min(2, "እባክዎን የአባትዎ ስም ቢያንስ 2 ፊደላት መሆን አለበት")
    .max(50, "እባክዎን የአባትዎ ስም ከ50 ፊደላት መብለጥ የለበትም"),
  email: z.string().email("እባክዎን ትክክለኛ የኢሜይል አድራሻ ያስገቡ"),
  phone: z.string().regex(/^\+?[0-9]{10,14}$/, "እባክዎን ትክክለኛ ስልክ ቁጥር ያስገቡ። ምሳሌ፡ +251912345678"),
  userName: z
    .string()
    .min(4, "እባክዎን የተጠቃሚ ስምዎ ቢያንስ 4 ፊደላት መሆን አለበት")
    .max(20, "እባክዎን የተጠቃሚ ስምዎ ከ20 ፊደላት መብለጥ የለበትም"),
  password: z
    .string()
    .min(8, "እባክዎን የይለፍ ቃልዎ ቢያንስ 8 ፊደላት መሆን አለበት")
    .regex(/[A-Z]/, "እባክዎን የይለፍ ቃልዎ ቢያንስ አንድ ከፍተኛ ፊደል መያዝ አለበት")
    .regex(/[a-z]/, "እባክዎን የይለፍ ቃልዎ ቢያንስ አንድ ትንሽ ፊደል መያዝ አለበት")
    .regex(/[0-9]/, "እባክዎን የይለፍ ቃልዎ ቢያንስ አንድ ቁጥር መያዝ አለበት")
    .regex(/[^A-Za-z0-9]/, "እባክዎን የይለፍ ቃልዎ ቢያንስ አንድ ልዩ ምልክት መያዝ አለበት"),
})

export type HiwasRegistrationFormData = z.infer<typeof hiwasRegistrationSchema>