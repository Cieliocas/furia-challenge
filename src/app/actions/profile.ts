"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"

export async function getUserProfile() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: "Usuário não autenticado" }
    }

    const userId = session.user.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        socialConnections: true,
      },
    })

    if (!user) {
      return { success: false, error: "Usuário não encontrado" }
    }

    return { success: true, data: user }
  } catch (error) {
    console.error("Erro ao buscar perfil:", error)
    return { success: false, error: "Falha ao carregar perfil" }
  }
}

export async function updateUserProfile(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: "Usuário não autenticado" }
    }

    const userId = session.user.id
    const name = formData.get("name") as string
    const bio = formData.get("bio") as string
    const favoriteGame = formData.get("favoriteGame") as string
    const favoritePlayer = formData.get("favoritePlayer") as string

    // Atualizar usuário
    await prisma.user.update({
      where: { id: userId },
      data: {
        name,
      },
    })

    // Atualizar perfil
    await prisma.profile.update({
      where: { userId },
      data: {
        bio,
        favoriteGame,
        favoritePlayer,
      },
    })

    // Registrar atividade
    await prisma.activity.create({
      data: {
        userId,
        type: "PROFILE_UPDATE",
        description: "Usuário atualizou seu perfil",
      },
    })

    revalidatePath("/dashboard/profile")
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error)
    return { success: false, error: "Falha ao atualizar perfil" }
  }
}
