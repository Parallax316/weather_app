"use client"

import { useState } from "react"
import { Info } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function InfoTab() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <Button 
        onClick={() => setIsOpen(!isOpen)}
        variant="default"
        size="icon"
        className="h-12 w-12 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white"
      >
        <Info className="h-6 w-6" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-[10000] flex items-center justify-center p-4">
          <div className="bg-background p-6 rounded-lg shadow-xl max-w-3xl max-h-[90vh] overflow-y-auto w-full relative">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:bg-muted/50"
            >
              ✕
            </Button>

            <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 text-transparent bg-clip-text">
              About Weather App
            </h2>
            
            <div className="space-y-6">
              {/* Creator Information */}
              <div className="bg-card/50 rounded-lg p-4 border border-border/30">
                <h3 className="text-lg font-semibold mb-2 text-foreground">Created By</h3>
                <p className="text-foreground">Simarpreet Singh</p>
                <a 
                  href="mailto:simarpreetsingh0316@gmail.com" 
                  className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  simarpreetsingh0316@gmail.com
                </a>
              </div>

              {/* Company Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">About Product Manager Accelerator</h3>
                <p className="text-foreground/80">
                  The Product Manager Accelerator Program is designed to support PM professionals through every stage of their careers. From students looking for entry-level jobs to Directors looking to take on a leadership role, our program has helped over hundreds of students fulfill their career aspirations.
                </p>
                <p className="text-foreground/80">
                  Our Product Manager Accelerator community are ambitious and committed. Through our program they have learnt, honed and developed new PM and leadership skills, giving them a strong foundation for their future endeavors.
                </p>

                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Our Services:</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="mr-2">🚀</span>
                      <div>
                        <strong className="text-foreground">PMA Pro</strong>
                        <p className="text-foreground/70">End-to-end product manager job hunting program that helps you master FAANG-level Product Management skills, conduct unlimited mock interviews, and gain job referrals through our largest alumni network. 25% of our offers came from tier 1 companies and get paid as high as $800K/year.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">🚀</span>
                      <div>
                        <strong className="text-foreground">AI PM Bootcamp</strong>
                        <p className="text-foreground/70">Gain hands-on AI Product Management skills by building a real-life AI product with a team of AI Engineers, data scientists, and designers. We will also help you launch your product with real user engagement using our 100,000+ PM community and social media channels.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">🚀</span>
                      <div>
                        <strong className="text-foreground">PMA Power Skills</strong>
                        <p className="text-foreground/70">Designed for existing product managers to sharpen their product management skills, leadership skills, and executive presentation skills</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">🚀</span>
                      <div>
                        <strong className="text-foreground">PMA Leader</strong>
                        <p className="text-foreground/70">We help you accelerate your product management career, get promoted to Director and product executive levels, and win in the board room.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">🚀</span>
                      <div>
                        <strong className="text-foreground">1:1 Resume Review</strong>
                        <p className="text-foreground/70">We help you rewrite your killer product manager resume to stand out from the crowd, with an interview guarantee. Get started by using our FREE killer PM resume template used by over 14,000 product managers.</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Company Details:</h4>
                  <ul className="space-y-1 text-foreground/70">
                    <li>Website: <a href="https://www.pmaccelerator.io/" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">pmaccelerator.io</a></li>
                    <li>Phone: +19548891063</li>
                    <li>Industry: E-Learning Providers</li>
                    <li>Company size: 2-10 employees</li>
                    <li>Headquarters: Boston, MA</li>
                    <li>Founded: 2020</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Free Resources:</h4>
                  <p className="text-foreground/70">
                    We also published over 500+ free training and courses. Please visit:
                  </p>
                  <ul className="space-y-1">
                    <li>YouTube: <a href="https://www.youtube.com/c/drnancyli" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">youtube.com/c/drnancyli</a></li>
                    <li>Instagram: <a href="https://instagram.com/drnancyli" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">@drnancyli</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 