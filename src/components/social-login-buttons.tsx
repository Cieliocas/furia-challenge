import { Button } from "@/src/components/ui/button"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { FaGoogle, FaTwitter, FaDiscord } from "react-icons/fa"

export function SocialLoginButtons() {
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleSocialLogin = async (provider: string) => {
    try {
      setIsLoading(provider)
      await signIn(provider, { callbackUrl: "/dashboard" })
    } catch (error) {
      console.error(`Erro ao fazer login com ${provider}:`, error)
    }
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      <Button
        variant="outline"
        className="border-gray-600 hover:bg-gray-700 text-white"
        onClick={() => handleSocialLogin("google")}
        disabled={isLoading !== null}
      >
        <FaGoogle className="mr-2 h-4 w-4" />
        {isLoading === "google" ? "..." : "Google"}
      </Button>
      <Button
        variant="outline"
        className="border-gray-600 hover:bg-gray-700 text-white"
        onClick={() => handleSocialLogin("twitter")}
        disabled={isLoading !== null}
      >
        <FaTwitter className="mr-2 h-4 w-4" />
        {isLoading === "twitter" ? "..." : "Twitter"}
      </Button>
      <Button
        variant="outline"
        className="border-gray-600 hover:bg-gray-700 text-white"
        onClick={() => handleSocialLogin("discord")}
        disabled={isLoading !== null}
      >
        <FaDiscord className="mr-2 h-4 w-4" />
        {isLoading === "discord" ? "..." : "Discord"}
      </Button>
    </div>
  )
}
