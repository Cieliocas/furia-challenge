"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"

export async function getQuestions() {
  try {
    const questions = await prisma.question.findMany({
      orderBy: {
        order: "asc",
      },
    })
    return { success: true, data: questions }
  } catch (error) {
    console.error("Erro ao buscar perguntas:", error)
    return { success: false, error: "Falha ao carregar perguntas" }
  }
}

export async function saveQuestionnaireResponse(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: "Usuário não autenticado" }
    }

    const userId = session.user.id
    const questionId = formData.get("questionId") as string
    const answer = formData.get("answer") as string

    if (!questionId || !answer) {
      return { success: false, error: "Dados incompletos" }
    }

    // Salvar ou atualizar resposta
    await prisma.questionnaireResponse.upsert({
      where: {
        userId_questionId: {
          userId,
          questionId,
        },
      },
      update: {
        answer,
      },
      create: {
        userId,
        questionId,
        answer,
      },
    })

    // Atualizar taxa de conclusão do perfil
    await updateProfileCompletionRate(userId)

    // Registrar atividade
    await prisma.activity.create({
      data: {
        userId,
        type: "QUESTIONNAIRE",
        description: "Usuário respondeu uma pergunta do questionário",
        metadata: {
          questionId,
        },
      },
    })

    revalidatePath("/questionnaire")
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Erro ao salvar resposta:", error)
    return { success: false, error: "Falha ao salvar resposta" }
  }
}

export async function completeQuestionnaire() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: "Usuário não autenticado" }
    }

    const userId = session.user.id

    // Determinar o tipo de fã com base nas respostas
    const fanType = await determineFanType(userId)

    // Atualizar o perfil do usuário
    await prisma.profile.update({
      where: { userId },
      data: {
        fanType,
        // Outros campos podem ser atualizados aqui com base nas respostas
      },
    })

    // Registrar atividade
    await prisma.activity.create({
      data: {
        userId,
        type: "QUESTIONNAIRE_COMPLETED",
        description: "Usuário completou o questionário",
        metadata: {
          fanType,
        },
      },
    })

    revalidatePath("/dashboard")

    return { success: true, fanType }
  } catch (error) {
    console.error("Erro ao completar questionário:", error)
    return { success: false, error: "Falha ao processar questionário" }
  }
}

// Funções auxiliares
async function updateProfileCompletionRate(userId: string) {
  const totalQuestions = await prisma.question.count()
  const answeredQuestions = await prisma.questionnaireResponse.count({
    where: { userId },
  })

  const completionRate = Math.round((answeredQuestions / totalQuestions) * 100)

  await prisma.profile.update({
    where: { userId },
    data: { completionRate },
  })
}

async function determineFanType(userId: string) {
  // Buscar todas as respostas do usuário
  const responses = await prisma.questionnaireResponse.findMany({
    where: { userId },
    include: {
      user: true,
    },
  })

  // Buscar todos os tipos de fãs e seus critérios
  const fanTypes = await prisma.fanType.findMany()

  // Lógica para determinar o tipo de fã com base nas respostas
  // Esta é uma implementação simplificada
  let bestMatch = "Super Torcedor" // Valor padrão
  let highestScore = 0

  for (const fanType of fanTypes) {
    const criteria = fanType.criteria as Record<string, string[]>
    let score = 0

    for (const response of responses) {
      const questionId = response.questionId
      const answer = response.answer

      if (criteria[questionId] && criteria[questionId].includes(answer)) {
        score++
      }
    }

    if (score > highestScore) {
      highestScore = score
      bestMatch = fanType.name
    }
  }

  // Atualizar pontuações no perfil
  await prisma.profile.update({
    where: { userId },
    data: {
      engagementScore: Math.min(Math.round(Math.random() * 30) + 70, 100), // Simulação
      knowledgeScore: Math.min(Math.round(Math.random() * 30) + 70, 100), // Simulação
      loyaltyScore: Math.min(Math.round(Math.random() * 30) + 70, 100), // Simulação
    },
  })

  return bestMatch
}
