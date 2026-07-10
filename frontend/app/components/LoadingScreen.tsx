interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'Carregando...' }: LoadingScreenProps) {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-gray-100 dark:bg-gray-950 transition-colors">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <span className="absolute h-full w-full animate-ping rounded-full bg-blue-500/30" />
        <span className="absolute h-full w-full rounded-full border-4 border-gray-200 dark:border-gray-800" />
        <span className="absolute h-full w-full animate-spin rounded-full border-4 border-transparent border-t-blue-600" />
      </div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">
        {message}
      </p>
    </div>
  );
}
