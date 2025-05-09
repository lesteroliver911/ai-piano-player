import React, { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card, CardContent } from "./ui/card";
import { Loader2 } from "lucide-react";

interface PromptInputProps {
  onGenerate: (prompt: string) => Promise<void>;
  isGenerating?: boolean;
}

const PromptInput = ({
  onGenerate = async () => {},
  isGenerating = false,
}: PromptInputProps) => {
  const [prompt, setPrompt] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setError("");
    try {
      await onGenerate(prompt);
    } catch (err) {
      setError("Failed to generate music. Please try again.");
    }
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    if (error) setError("");
  };

  const placeholderExamples = [
    "Play a melancholic jazz piece",
    "Create a cheerful lullaby",
    "Compose a classical sonata in C major",
    "Generate a relaxing piano melody",
  ];

  const placeholder = `Enter your music prompt here...

Examples:
${placeholderExamples.join("\n")}`;

  return (
    <Card className="w-full max-w-3xl mx-auto bg-white shadow-md">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder={placeholder}
              value={prompt}
              onChange={handlePromptChange}
              className="min-h-[120px] resize-y"
              disabled={isGenerating}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isGenerating || !prompt.trim()}
              className="px-6"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Music"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PromptInput;
