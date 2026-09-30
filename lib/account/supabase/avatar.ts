import { getAccountClient } from "@/lib/account/supabase/client"
import { patchAccountSnapshot } from "@/lib/account/store"
import { ACCOUNT_ERROR_COPY, AccountError } from "@/lib/account/types"
import { validateAvatarFile } from "@/lib/account/validation"

const AVATAR_BUCKET = "avatars"

type PublicUrlClient = {
  storage: {
    from: (bucket: string) => {
      getPublicUrl: (path: string) => {
        data: {
          publicUrl: string
        }
      }
    }
  }
}

export const avatarObjectPath = (userId: string) => {
  return `${userId}/avatar`
}

export const publicAvatarUrl = (
  supabase: PublicUrlClient,
  objectPath: string,
  updatedAt: string,
) => {
  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(objectPath)
  return `${data.publicUrl}?v=${encodeURIComponent(updatedAt)}`
}

const requireUser = async () => {
  const supabase = getAccountClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new AccountError("account_not_found", ACCOUNT_ERROR_COPY.account_not_found)
  }

  return { supabase, user }
}

export const saveAvatar = async (file: File) => {
  validateAvatarFile(file)

  const { supabase, user } = await requireUser()
  const objectPath = avatarObjectPath(user.id)

  const { error: uploadError } = await supabase.storage.from(AVATAR_BUCKET).upload(objectPath, file, {
    upsert: true,
    contentType: file.type,
  })

  if (uploadError) {
    throw new AccountError("avatar_save_failed", ACCOUNT_ERROR_COPY.avatar_save_failed)
  }

  const { data, error } = await supabase
    .from("avatars")
    .upsert(
      {
        user_id: user.id,
        object_path: objectPath,
      },
      { onConflict: "user_id" },
    )
    .select("object_path, updated_at")
    .single()

  if (error || !data) {
    throw new AccountError("avatar_save_failed", ACCOUNT_ERROR_COPY.avatar_save_failed)
  }

  const avatarUrl = publicAvatarUrl(supabase, data.object_path, data.updated_at)
  patchAccountSnapshot({ avatarUrl })
  return avatarUrl
}

export const removeAvatar = async () => {
  const { supabase, user } = await requireUser()
  const objectPath = avatarObjectPath(user.id)

  const { error: storageError } = await supabase.storage.from(AVATAR_BUCKET).remove([objectPath])

  if (storageError) {
    throw new AccountError("avatar_remove_failed", ACCOUNT_ERROR_COPY.avatar_remove_failed)
  }

  const { error } = await supabase.from("avatars").delete().eq("user_id", user.id)

  if (error) {
    throw new AccountError("avatar_remove_failed", ACCOUNT_ERROR_COPY.avatar_remove_failed)
  }

  patchAccountSnapshot({ avatarUrl: null })
}
