import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "../../lib/utils";
import {
  LayoutDashboard,
  Menu,
  X,
  BookOpen,
  ListChecks,
  FileText,
  MessageSquare,
  GraduationCap
} from "lucide-react";
import { Button } from "../ui/button";
import { selectUserRole } from "../../redux/features/user/userSlice";
import { useSelector } from "react-redux";

function NavigationBar() {
  const [isOpen, setIsOpen] = useState(false);
  const role = useSelector(selectUserRole);

  // Navigation items for curator (admin) role
  const curatorNavigation = [
    { name: "Skills", href: "/home/curator", icon: GraduationCap },
    { name: "Roadmap Steps", href: "/home/curator/roadmap-step", icon: ListChecks },
    { name: "Learning Resources", href: "/home/curator/learning-resource", icon: FileText },
  ];  
  
  // Navigation items for learner role
  const learnerNavigation = [
    { name: "Dashboard", href: "/home/learner", icon: LayoutDashboard },
    { name: "Roadmap", href: "/home/learner/roadmap", icon: BookOpen },
    { name: "Discussions", href: "/home/learner/discussions", icon: MessageSquare },
  ];
  
  // Set navigation based on user role
  const navigation = role === "learner" ? learnerNavigation : curatorNavigation

  // Close mobile menu when screen size becomes large
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Navigation Menu */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 border-r bg-card transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:fixed",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col gap-2">
          <div className="border-b">
            <div className="flex h-16 items-center gap-2 px-6">
              <span className="text-xl font-semibold">Masai</span>
            </div>
          </div>

          <div className="flex-1 space-y-1 p-4">
            <nav className="flex flex-1 flex-col gap-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground"
                    )
                  }
                  end
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}

export default NavigationBar;
