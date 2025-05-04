"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"

export async function connectSocialAccount(
  provider: string,
  providerId: string,
  accessToken: string,
  refreshToken?: string,
  expiresAt?: Date,
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: "Usuário não autenticado" }
    }

    const userId = session.user.id

    // Verificar se já existe uma conexão para este provedor
    const existingConnection = await prisma.socialConnection.findUnique({
      where: {
        userId_provider: {
          userId,
          provider,
        },
      },
    })

    if (existingConnection) {
      // Atualizar conexão existente
      await prisma.socialConnection.update({
        where: {
          id: existingConnection.id,
        },
        data: {
          providerId,
          accessToken,
          refreshToken,
          expiresAt,
        },
      })
    } else {
      // Criar nova conexão
      await prisma.socialConnection.create({
        data: {
          userId,
          provider,
          providerId,
          accessToken,
          refreshToken,
          expiresAt,
        },
      })
    }

    // Registrar atividade
    await prisma.activity.create({
      data: {
        userId,
        type: "SOCIAL_CONNECT",
        description: `Usuário conectou conta ${provider}`,
      },
    })

    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error(`Erro ao conectar conta ${provider}:`, error)
    return { success: false, error: `Falha ao conectar conta ${provider}` }
  }
}

export async function disconnectSocialAccount(provider: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: "Usuário não autenticado" }
    }

    const userId = session.user.id

    // Remover conexão
    await prisma.socialConnection.delete({
      where: {
        userId_provider: {
          userId,
          provider,
        },
      },
    })

    // Registrar atividade
    await prisma.activity.create({
      data: {
        userId,
        type: "SOCIAL_DISCONNECT",
        description: `Usuário desconectou conta ${provider}`,
      },
    })

    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error(`Erro ao desconectar conta ${provider}:`, error)
    return { success: false, error: `Falha ao desconectar conta ${provider}` }
  }
}

export async function getSocialConnections() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: "Usuário não autenticado" }
    }

    const userId = session.user.id

    const connections = await prisma.socialConnection.findMany({
      where: { userId },
    })

    return { success: true, data: connections }
  } catch (error) {
    console.error("Erro ao buscar conexões sociais:", error)
    return { success: false, error: "Falha ao carregar conexões sociais" }
  }
}
