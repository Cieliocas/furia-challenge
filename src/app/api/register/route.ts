import { NextResponse } from "next/server"
import { hash } from "bcrypt"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    // Validação básica
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Dados incompletos. Nome, email e senha são obrigatórios." }, { status: 400 })
    }

    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "Este email já está em uso." }, { status: 409 })
    }

    // Hash da senha
    const hashedPassword = await hash(password, 10)

    // Criar o usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        accounts: {
          create: {
            type: "credentials",
            provider: "credentials",
            providerAccountId: email,
            access_token: hashedPassword,
          },
        },
        profile: {
          create: {},
        },
      },
    })

    // Registrar atividade
    await prisma.activity.create({
      data: {
        userId: user.id,
        type: "REGISTRATION",
        description: "Usuário criou uma conta",
      },
    })

    return NextResponse.json({ message: "Usuário registrado com sucesso" }, { status: 201 })
  } catch (error) {
    console.error("Erro ao registrar usuário:", error)
    return NextResponse.json({ error: "Erro ao processar o registro" }, { status: 500 })
  }
}
