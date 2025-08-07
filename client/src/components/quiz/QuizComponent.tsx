import { useState } from "react";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useStore } from "@/store/useStore";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import type { QuizQuestion } from "@/types";

const quizQuestions: QuizQuestion[] = [
  {
    id: "livingSituation",
    question: "What's your living situation?",
    type: "single",
    options: [
      { value: "apartment", label: "Apartment", description: "Small living space", icon: "🏢", weight: 1 },
      { value: "house_small_yard", label: "House with Small Yard", description: "Some outdoor space", icon: "🏠", weight: 2 },
      { value: "house_large_yard", label: "House with Large Yard", description: "Plenty of outdoor space", icon: "🏡", weight: 3 },
      { value: "farm_rural", label: "Farm/Rural Property", description: "Lots of open space", icon: "🚜", weight: 4 },
    ],
    required: true,
  },
  {
    id: "exerciseTime",
    question: "How much time can you dedicate to daily exercise?",
    type: "single",
    options: [
      { value: "minimal", label: "15-30 minutes", description: "Short walks, minimal activity", icon: "🛋️", weight: 1 },
      { value: "moderate", label: "30-60 minutes", description: "Daily walks, some play time", icon: "🚶", weight: 3 },
      { value: "active", label: "1-2 hours", description: "Long walks, jogging, active play", icon: "🏃", weight: 4 },
      { value: "very_active", label: "2+ hours", description: "High-intensity activities, sports", icon: "🏋️", weight: 5 },
    ],
    required: true,
  },
  {
    id: "experience",
    question: "What's your experience with dogs?",
    type: "single",
    options: [
      { value: "first_time", label: "First-time owner", description: "Never owned a dog before", icon: "🆕", weight: 1 },
      { value: "some_experience", label: "Some experience", description: "Had dogs before, basic knowledge", icon: "📚", weight: 2 },
      { value: "experienced", label: "Very experienced", description: "Extensive experience with training", icon: "🎓", weight: 3 },
    ],
    required: true,
  },
  {
    id: "familySituation",
    question: "Do you have children at home?",
    type: "single",
    options: [
      { value: "no_children", label: "No children", description: "Adult-only household", icon: "👥", weight: 0 },
      { value: "young_children", label: "Young children (0-5)", description: "Toddlers and young kids", icon: "👶", weight: 1 },
      { value: "school_age", label: "School-age children (6-12)", description: "Elementary school age", icon: "🎒", weight: 2 },
      { value: "teenagers", label: "Teenagers (13+)", description: "Responsible older children", icon: "👦", weight: 3 },
    ],
    required: true,
  },
  {
    id: "groomingPreference",
    question: "How do you feel about grooming requirements?",
    type: "single",
    options: [
      { value: "minimal", label: "Minimal grooming", description: "Occasional brushing only", icon: "✂️", weight: 1 },
      { value: "moderate", label: "Moderate grooming", description: "Weekly brushing and occasional baths", icon: "🛁", weight: 2 },
      { value: "high", label: "Don't mind high grooming", description: "Daily brushing, professional grooming", icon: "💅", weight: 3 },
    ],
    required: true,
  },
  {
    id: "sizePref",
    question: "What size dog do you prefer?",
    type: "single",
    options: [
      { value: "toy", label: "Toy (2-12 lbs)", description: "Very small dogs", icon: "🐕‍🦺", weight: 1 },
      { value: "small", label: "Small (12-25 lbs)", description: "Compact and portable", icon: "🐕", weight: 2 },
      { value: "medium", label: "Medium (25-60 lbs)", description: "Perfect balance of size", icon: "🐶", weight: 3 },
      { value: "large", label: "Large (60+ lbs)", description: "Big, impressive dogs", icon: "🐕‍🦺", weight: 4 },
    ],
    required: true,
  },
  {
    id: "energyPreference",
    question: "What energy level do you prefer?",
    type: "single",
    options: [
      { value: "low", label: "Low energy", description: "Calm, relaxed companion", icon: "😴", weight: 1 },
      { value: "moderate", label: "Moderate energy", description: "Balanced activity level", icon: "🚶", weight: 3 },
      { value: "high", label: "High energy", description: "Active, playful companion", icon: "⚡", weight: 5 },
    ],
    required: true,
  },
  {
    id: "trainabilityImportance",
    question: "How important is trainability to you?",
    type: "single",
    options: [
      { value: "not_important", label: "Not very important", description: "Personality matters more", icon: "🤷", weight: 1 },
      { value: "somewhat", label: "Somewhat important", description: "Basic obedience is enough", icon: "📖", weight: 2 },
      { value: "very_important", label: "Very important", description: "Easy training is essential", icon: "🏆", weight: 3 },
    ],
    required: true,
  },
];

interface QuizComponentProps {
  onComplete?: (results: any) => void;
}

export default function QuizComponent({ onComplete }: QuizComponentProps) {
  const { user } = useAuth();
  const {
    currentStep,
    totalSteps,
    responses,
    updateQuizResponse,
    nextQuizStep,
    previousQuizStep,
    setQuizResults,
    showToast,
  } = useStore();

  const [sessionId] = useState(() => Math.random().toString(36).substring(7));

  const submitQuizMutation = useMutation({
    mutationFn: async (quizResponses: Record<string, any>) => {
      const res = await apiRequest("POST", "/api/quiz/submit", {
        responses: quizResponses,
        userId: user?.id || null,
        sessionId: user ? null : sessionId,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setQuizResults(data);
      showToast("Quiz completed! Here are your matches.", "success");
      if (onComplete) {
        onComplete(data);
      }
    },
    onError: (error) => {
      console.error("Quiz submission error:", error);
      showToast("Failed to submit quiz. Please try again.", "error");
    },
  });

  const currentQuestion = quizQuestions[currentStep - 1];
  const progress = (currentStep / totalSteps) * 100;
  const currentAnswer = responses[currentQuestion?.id];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      nextQuizStep();
    } else {
      // Submit quiz
      submitQuizMutation.mutate(responses);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      previousQuizStep();
    }
  };

  const handleAnswerChange = (value: string) => {
    updateQuizResponse(currentQuestion.id, value);
  };

  if (!currentQuestion) {
    return null;
  }

  const canProceed = currentAnswer && currentQuestion.required;
  const isLastStep = currentStep === totalSteps;

  return (
    <Card className="clay-morphic rounded-3xl p-8 shadow-clay max-w-4xl mx-auto">
      <CardContent className="p-0">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm font-medium text-midnight/70 mb-2">
            <span>Question {currentStep} of {totalSteps}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress
            value={progress}
            className="w-full h-2 bg-softgray rounded-full"
            data-testid="quiz-progress"
          />
        </div>

        {/* Question */}
        <div className="mb-8">
          <h3 className="font-montserrat font-bold text-2xl text-midnight mb-6">
            {currentQuestion.question}
          </h3>
          
          <RadioGroup
            value={currentAnswer || ""}
            onValueChange={handleAnswerChange}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {currentQuestion.options.map((option) => (
              <div key={option.value} className="relative">
                <RadioGroupItem
                  value={option.value}
                  id={option.value}
                  className="sr-only"
                  data-testid={`quiz-option-${option.value}`}
                />
                <Label
                  htmlFor={option.value}
                  className="cursor-pointer block"
                >
                  <div
                    className={`p-6 rounded-2xl border-2 transition-all duration-200 ${
                      currentAnswer === option.value
                        ? 'border-mustard bg-mustard/10 shadow-clay'
                        : 'border-lavender/30 hover:border-lavender hover:bg-lavender/5'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-lavender/30 rounded-2xl flex items-center justify-center text-2xl">
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-midnight">{option.label}</h4>
                        <p className="text-sm text-midnight/70">{option.description}</p>
                      </div>
                      {currentAnswer === option.value && (
                        <CheckCircle className="w-6 h-6 text-mustard" />
                      )}
                    </div>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            variant="outline"
            className="bg-softgray text-midnight px-8 py-3 rounded-2xl font-medium shadow-clay hover:shadow-clay-hover transition-all disabled:opacity-50"
            data-testid="quiz-previous-button"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!canProceed || submitQuizMutation.isPending}
            className="bg-mustard text-midnight px-8 py-3 rounded-2xl font-semibold shadow-clay hover:shadow-clay-hover transition-all disabled:opacity-50"
            data-testid="quiz-next-button"
          >
            {submitQuizMutation.isPending ? (
              "Analyzing..."
            ) : isLastStep ? (
              "Get Results"
            ) : (
              <>
                Next Question
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
