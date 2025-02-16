'use client';
import { useAuthStore } from "@/stores/authStore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button";
import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation"

export default function Settings() {
 
  const { user } = useAuthStore()
  const router = useRouter()
  const logout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("accessToken")
    router.push("/")
  }
  return (
    <>
    <div className="grid grid-cols-2 p-2">
    <div>
            <h3 className="text-lg font-semibold">{user?.firstName} {user?.lastName}</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="text-sm text-muted-foreground">{user?.phone}</p>
            </div>
    { user?.role == "Hiwas" ? (<div>
            <h3 className="text-lg font-semibold">{
              `You are the Hiwas of the following meseretawi dirijit ${user.meseretawiDirijet.firstName} ${user.meseretawiDirijet.lastName}`}</h3>
              <p className="text-sm text-muted-foreground">{`Meseretawi dirijit Email ${user.meseretawiDirijet.email}`}</p>
              <p className="text-sm text-muted-foreground">{`Meseretawi dirijit Phone ${user.meseretawiDirijet.phone}`}</p>
            </div>
            ):<></>
            }
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="text-red-500 px-4 py-2 w-full border-0" size="sm">
                  <LogOutIcon className="w-4 h-4" />
                  ይዉጡ
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>ዘግተህ መውጣት መፈለገዎትን ያረጋግጡ?</AlertDialogTitle>
                  <AlertDialogDescription>
                  መውጣት   ከወጡ ቦሀላ ዳሽቦርዱን ለመጠቀም እንደገና መግባትን ይጠበቅበወታል።
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>ተዉ</AlertDialogCancel>
                  <AlertDialogAction onClick={logout}>ይዉጡ</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
    </div>
    </>
  );
}
