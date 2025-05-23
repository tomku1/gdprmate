import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { useAuth } from "../hooks/useAuth";
import { UserMenu } from "../layout/UserMenu";
import { useFeatureFlag } from "../hooks/useFeatureFlag";

export function NavBar() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const enableRegistration = useFeatureFlag("enableRegistration");

  useEffect(() => {
    setIsClient(true);
  }, []);

  const showAuthButtons = isClient && !isAuthenticated && !isLoading;
  const showUserMenu = isClient && isAuthenticated;

  return (
    <header className="border-b py-4">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <a href="/" className="text-2xl font-bold text-primary">
            GdprMate
          </a>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="/" className="text-sm font-medium hover:text-primary transition-colors">
              Strona główna
            </a>

            {/* Link to Dashboard/History for authenticated users */}
            {showUserMenu && (
              <a href="/dashboard?tab=history" className="text-sm font-medium hover:text-primary transition-colors">
                Historia analiz
              </a>
            )}

            {/* Authentication Buttons - initially hidden on server, shown on client if not authenticated */}
            {showAuthButtons && (
              <div className="flex items-center space-x-2">
                <a href="/login">
                  <Button variant="outline" size="sm">
                    Zaloguj się
                  </Button>
                </a>
                {enableRegistration && (
                  <a href="/register">
                    <Button size="sm">Zarejestruj się</Button>
                  </a>
                )}
              </div>
            )}

            {/* User Menu for authenticated users - initially hidden on server, shown on client if authenticated */}
            {showUserMenu && <UserMenu />}
          </div>

          {/* Mobile Navigation Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Zamknij menu" : "Otwórz menu"}
            >
              {isMenuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <line x1="4" x2="20" y1="12" y2="12"></line>
                  <line x1="4" x2="20" y1="6" y2="6"></line>
                  <line x1="4" x2="20" y1="18" y2="18"></line>
                </svg>
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-2">
            <div className="flex flex-col space-y-3">
              <a href="/" className="text-sm font-medium hover:text-primary transition-colors py-2">
                Strona główna
              </a>

              {/* Link to Dashboard/History for authenticated users (Mobile) */}
              {showUserMenu && (
                <a
                  href="/dashboard?tab=history"
                  className="text-sm font-medium hover:text-primary transition-colors py-2"
                >
                  Historia analiz
                </a>
              )}

              {/* Authentication Buttons - initially hidden on server, shown on client if not authenticated */}
              {showAuthButtons && (
                <div className="flex flex-col space-y-2 pt-2">
                  <a href="/login" className="w-full">
                    <Button variant="outline" size="sm" className="w-full">
                      Zaloguj się
                    </Button>
                  </a>
                  {enableRegistration && (
                    <a href="/register" className="w-full">
                      <Button size="sm" className="w-full">
                        Zarejestruj się
                      </Button>
                    </a>
                  )}
                </div>
              )}

              {/* User Menu - initially hidden on server, shown on client if authenticated */}
              {showUserMenu && (
                <div className="pt-2 border-t">
                  <UserMenu isMobile={true} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
