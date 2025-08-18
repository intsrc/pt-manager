import { AppShell } from "@/components/layout/app-shell"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function WaiverPage() {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Liability Waiver</h1>
          <p className="text-muted-foreground">Please read this waiver carefully before booking your session</p>
        </div>

        <GlassCard className="p-8">
          <div className="prose prose-invert max-w-none space-y-6">
            <h2 className="text-xl font-semibold">Assumption of Risk and Release of Liability</h2>

            <p className="text-muted-foreground">
              By participating in personal training sessions at Kolizey Fitness Center, I acknowledge and understand
              that:
            </p>

            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="font-semibold text-foreground mb-2">1. Assumption of Risk</h3>
                <p>
                  I understand that physical exercise and the use of exercise equipment involve inherent risks of
                  injury, including but not limited to muscle strains, sprains, fractures, and other injuries that may
                  result from my participation in fitness activities.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">2. Medical Clearance</h3>
                <p>
                  I represent that I am in good physical condition and have no medical conditions that would prevent my
                  safe participation in the training program. I have consulted with a physician if I have any concerns
                  about my ability to participate.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">3. Release of Liability</h3>
                <p>
                  I hereby release, waive, and discharge Kolizey Fitness Center, its trainers, employees, and agents
                  from any and all claims, demands, or causes of action arising from my participation in training
                  sessions, whether caused by negligence or otherwise.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">4. Indemnification</h3>
                <p>
                  I agree to indemnify and hold harmless Kolizey Fitness Center from any claims brought by third parties
                  arising from my participation in training sessions.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">5. Emergency Medical Treatment</h3>
                <p>
                  I authorize Kolizey Fitness Center to obtain emergency medical treatment for me if necessary, and I
                  agree to be responsible for the cost of such treatment.
                </p>
              </div>
            </div>

            <div className="border-t border-border/40 pt-6">
              <p className="text-sm text-muted-foreground">
                This waiver shall be binding upon my heirs, executors, administrators, and assigns. I have read this
                waiver carefully and understand its contents.
              </p>
            </div>
          </div>
        </GlassCard>

        <div className="text-center">
          <Link href="/find">
            <Button className="glass-button">Back to Trainers</Button>
          </Link>
        </div>
      </div>
    </AppShell>
  )
}
