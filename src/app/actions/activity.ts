"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route"

export async function getUserActivities(limit = 10) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: "Usuário não autenticado" }
    }

    const userId = session.user.id

    const activities = await prisma.activity.findMany({
      where: { userId },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    })

    return { success: true, data: activities }
  } catch (error) {
    console.error("Erro ao buscar atividades:", error)
    return { success: false, error: "Falha ao carregar atividades" }
  }
}

export async function logActivity(type: string, description: string, metadata?: any) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: "Usuário não autenticado" }
    }

    const userId = session.user.id

    await prisma.activity.create({
      data: {
        userId,
        type,
        description,
        metadata: metadata ? metadata : undefined,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Erro ao registrar atividade:", error)
    return { success: false, error: "Falha ao registrar atividade" }
  }
}
