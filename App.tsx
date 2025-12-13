/**
 * AetherHub 2049™ - Elev8minds LLC
 * Copyright © 2025 Elev8minds LLC. All rights reserved.
 * 
 * This software is the copyrighted property of Elev8minds LLC.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 * 
 * Trademarks: "AetherHub", "AetherHub 2049", and the AetherHub logo are owned by Elev8minds LLC.
 * For licensing inquiries: legal@elev8minds.com
 */

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
