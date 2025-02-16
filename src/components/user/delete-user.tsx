import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { apiURL } from "@/utils/constants/constants"
import axios from "axios"

interface DeleteUserAlertProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  userId: number
  userType: string
}

export function DeleteUserAlert({ isOpen, onClose, onConfirm, userId, userType }: DeleteUserAlertProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this user?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the user account and remove their data from our
            servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              try {
                await axios.put(`${apiURL}api/auth/delete`, {
                  id: userId,
                  type: userType,
                  isActive: false
                })
                onConfirm()
              } catch (error) {
                console.error("Error deleting user:", error)
              }
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

