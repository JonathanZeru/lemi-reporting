'use client';
import { useAuthStore } from "@/stores/authStore";

export default function Settings() {
 
  const { user } = useAuthStore()
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
    </div>
    </>
  );
}
