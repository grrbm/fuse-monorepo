import { Op } from 'sequelize'
import SequenceRun from '../../models/SequenceRun'
import Sequence from '../../models/Sequence'
import SequenceMessageDispatcher from './SequenceMessageDispatcher'

type StepPayload = {
  id?: string
  type?: string
  templateId?: string
  timeSeconds?: number
  useCustomText?: boolean
  customText?: string
  customSubject?: string
  customMergeFields?: string[]
  [key: string]: unknown
}

export default class SequenceRunWorker {
  private processingRuns = new Set<string>()
  private dispatcher = new SequenceMessageDispatcher()

  constructor() {
    void this.resumePendingRuns()
  }

  async enqueueRun(runId: string) {
    await this.processRun(runId)
  }

  private async resumePendingRuns() {
    try {
      const runs = await SequenceRun.findAll({
        where: {
          status: {
            [Op.in]: ['pending', 'processing']
          }
        }
      })

      for (const run of runs) {
        await this.processRun(run.id)
      }
    } catch (error) {
      console.error('❌ Failed to resume pending sequence runs:', error)
    }
  }

  private async processRun(runId: string) {
    if (this.processingRuns.has(runId)) {
      return
    }

    this.processingRuns.add(runId)

    try {
      const run = await SequenceRun.findByPk(runId)

      if (!run) {
        console.warn(`⚠️ SequenceRun ${runId} not found`)
        return
      }

      if (run.status === 'completed' || run.status === 'failed') {
        return
      }

      if (run.status !== 'processing') {
        run.status = 'processing'
        run.startedAt = new Date()
        await run.save()
      }

      const sequence = await Sequence.findByPk(run.sequenceId)

      if (!sequence) {
        await run.update({
          status: 'failed',
          failureReason: 'Associated sequence not found'
        })
        return
      }

      const steps = Array.isArray(sequence.steps) ? sequence.steps as StepPayload[] : []
      await this.executeSteps(run, sequence, steps)
    } catch (error) {
      console.error(`❌ Error processing sequence run ${runId}:`, error)
    } finally {
      this.processingRuns.delete(runId)
    }
  }

  private async executeSteps(run: SequenceRun, sequence: Sequence, steps: StepPayload[]) {
    try {
      const startIndex = Number.isFinite(run.currentStepIndex) ? run.currentStepIndex : 0

      for (let index = startIndex; index < steps.length; index += 1) {
        const step = steps[index]
        const stepType = (step.type || '').toString().toLowerCase()

        if (stepType === 'delay') {
          const seconds = typeof step.timeSeconds === 'number' ? step.timeSeconds : 0
          if (seconds > 0) {
            console.log(`⏱️ SequenceRun ${run.id}: waiting ${seconds} seconds before next step`)
            await this.delay(seconds * 1000)
          }
          run.currentStepIndex = index + 1
          await run.save()
          continue
        }

        if (stepType === 'sms' || stepType === 'email') {
          console.log(`🚀 SequenceRun ${run.id}: executing ${stepType} step ${step.id ?? ''} (index ${index})`)
          await this.dispatcher.dispatchStep(run, sequence, step)
          run.currentStepIndex = index + 1
          await run.save()
          continue
        }

        console.warn(`⚠️ SequenceRun ${run.id}: unknown step type "${stepType}"`)
      }

      await run.update({
        status: 'completed',
        completedAt: new Date(),
        failureReason: null,
        currentStepIndex: steps.length
      })

      console.log(`✅ SequenceRun ${run.id} completed`)

      // Update sequence analytics after completion
      await this.updateSequenceAnalytics(sequence.id)
    } catch (error) {
      console.error(`❌ SequenceRun ${run.id} failed:`, error)

      await run.update({
        status: 'failed',
        failureReason: error instanceof Error ? error.message : 'Unknown error executing sequence run'
      })

      // Update sequence analytics even on failure
      await this.updateSequenceAnalytics(sequence.id)
    }
  }

  private async updateSequenceAnalytics(sequenceId: string) {
    try {
      const runs = await SequenceRun.findAll({
        where: { sequenceId }
      })

      const totalRuns = runs.length
      const completedRuns = runs.filter(r => r.status === 'completed').length
      const totalEmailsSent = runs.reduce((sum, r) => sum + (r.emailsSent || 0), 0)
      const totalSmsSent = runs.reduce((sum, r) => sum + (r.smsSent || 0), 0)
      const totalEmailsOpened = runs.reduce((sum, r) => sum + (r.emailsOpened || 0), 0)
      const totalEmailsClicked = runs.reduce((sum, r) => sum + (r.emailsClicked || 0), 0)

      const totalSent = totalEmailsSent + totalSmsSent
      const openRate = totalEmailsSent > 0 ? (totalEmailsOpened / totalEmailsSent) * 100 : 0
      const clickRate = totalEmailsOpened > 0 ? (totalEmailsClicked / totalEmailsOpened) * 100 : 0

      const analytics = {
        totalSent,
        openRate: Math.round(openRate * 10) / 10,
        clickRate: Math.round(clickRate * 10) / 10,
        activeContacts: completedRuns,
        totalRuns,
        completedRuns,
        emailsSent: totalEmailsSent,
        smsSent: totalSmsSent,
        emailsOpened: totalEmailsOpened,
        emailsClicked: totalEmailsClicked
      }

      const sequence = await Sequence.findByPk(sequenceId)
      if (sequence) {
        sequence.analytics = analytics
        await sequence.save()
        console.log(`📊 Updated analytics for sequence ${sequenceId}`)
      }
    } catch (error) {
      console.error(`❌ Error updating sequence analytics for ${sequenceId}:`, error)
    }
  }

  private delay(ms: number) {
    return new Promise<void>((resolve) => {
      setTimeout(() => resolve(), ms)
    })
  }
}

