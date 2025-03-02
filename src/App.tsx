import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ShaderBackground, { ShaderOptions } from "./components/ShaderBackground";
// import BasicShader from "./components/BasicShader";
import "./App.css";

const queryClient = new QueryClient();

// Create a context for theme switching
import { createContext, useContext } from "react";

interface ThemeContextType {
  currentShader: string;
  setCurrentShader: (shader: string) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  currentShader: ShaderOptions.DEFAULT,
  setCurrentShader: () => {},
});

export const useTheme = () => useContext(ThemeContext);

const App = () => {
  const [currentShader, setCurrentShader] = useState<string>(ShaderOptions.DEFAULT);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeContext.Provider value={{ currentShader, setCurrentShader }}>
        {/* Shader Background (always first for z-index layering) */}
        <ShaderBackground className="shader-bg-debug" shaderPath={currentShader} />
        
        <div className="relative z-10"> {/* Wrapper to ensure proper z-index layering */}
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </div>
      </ThemeContext.Provider>
    </QueryClientProvider>
  );
};

export default App;
