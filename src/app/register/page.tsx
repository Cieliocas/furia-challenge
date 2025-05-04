"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Separator } from "@/src/components/ui/separator"
import { Checkbox } from "@/src/components/ui/checkbox"
import Link from "next/link"
import { FuriaLogo } from "@/src/components/furia-logo"
import { SocialLoginButtons } from "@/src/components/social-login-buttons"
import { useRouter } from "next/navigation"
import { useToast } from "@/src/components/ui/use-toast"

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    terms: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, terms: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.terms) {
      toast({
        title: "Termos não aceitos",
        description: "Você precisa aceitar os termos de serviço para continuar.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao registrar")
      }

      toast({
        title: "Conta criada com sucesso!",
        description: "Redirecionando para o login...",
      })

      // Redirecionar para login após registro bem-sucedido
      setTimeout(() => {
        router.push("/login")
      }, 1500)
    } catch (error) {
      console.error("Erro no registro:", error)
      toast({
        title: "Erro no registro",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao criar sua conta",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-black to-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 relative mb-4">
            <FuriaLogo />
          </div>
          <h1 className="text-2xl font-bold text-white">Crie sua conta no Know Your Fan</h1>
        </div>

        <Card className="bg-gray-800 border-gray-700 shadow-xl">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="text-white">Cadastro</CardTitle>
              <CardDescription className="text-gray-400">
                Crie sua conta para descobrir seu perfil de fã
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-gray-200">
                      Nome
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="Seu nome"
                      className="bg-gray-700 border-gray-600 text-white"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-gray-200">
                      Sobrenome
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="Seu sobrenome"
                      className="bg-gray-700 border-gray-600 text-white"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-200">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="bg-gray-700 border-gray-600 text-white"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-200">
                    Senha
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="bg-gray-700 border-gray-600 text-white"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" checked={formData.terms} onCheckedChange={handleCheckboxChange} required />
                  <label
                    htmlFor="terms"
                    className="text-sm text-gray-300 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Eu concordo com os{" "}
                    <Link href="/terms" className="text-purple-400 hover:text-purple-300">
                      termos de serviço
                    </Link>{" "}
                    e{" "}
                    <Link href="/privacy" className="text-purple-400 hover:text-purple-300">
                      política de privacidade
                    </Link>
                  </label>
                </div>
              </div>

              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
                {isLoading ? "Processando..." : "Criar Conta"}
              </Button>

              <div className="flex items-center gap-2 text-xs">
                <Separator className="flex-1 bg-gray-700" />
                <span className="text-gray-400">OU CONTINUE COM</span>
                <Separator className="flex-1 bg-gray-700" />
              </div>

              <SocialLoginButtons />
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-gray-400">
                Já tem uma conta?{" "}
                <Link href="/login" className="text-purple-400 hover:text-purple-300">
                  Entrar
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  )
}
