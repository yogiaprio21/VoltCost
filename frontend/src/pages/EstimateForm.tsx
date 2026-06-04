import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, ErrorAlert, Field, Input, PageHeader, Select, StatCard, toast } from '@components/UI'
import Icon from '@components/Icon'
import type { EstimateInput, EstimateResponse } from '@app-types/index'
import { createEstimate } from '@services/estimate'

const capacities: Array<EstimateInput['powerCapacity']> = [900, 1300, 2200, 3500]
const steps = ['Bangunan', 'Titik', 'Beban', 'Kualitas']

const defaultForm: EstimateInput = {
  houseArea: 100,
  lampPoints: 10,
  socketPoints: 10,
  acCount: 1,
  pumpCount: 0,
  powerCapacity: 2200,
  installationType: 'standard'
}

function clampNumber(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min
  return Math.max(min, Math.min(max, Math.round(value)))
}

export default function EstimateFormPage() {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)
  const [form, setForm] = useState<EstimateInput>(defaultForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const estimatedPoints = form.lampPoints + form.socketPoints + form.acCount + form.pumpCount
  const suggestedCircuits = Math.max(1, Math.ceil(estimatedPoints / 6))
  const qualityLabel = form.installationType === 'premium' ? 'Premium' : 'Standar'

  const errors = useMemo(() => ({
    houseArea: form.houseArea < 1 || form.houseArea > 1000 ? 'Luas rumah harus 1 sampai 1000 m2.' : null,
    lampPoints: form.lampPoints > 300 ? 'Titik lampu terlalu besar untuk estimasi cepat.' : null,
    socketPoints: form.socketPoints > 300 ? 'Jumlah stopkontak terlalu besar untuk estimasi cepat.' : null,
    acCount: form.acCount > 50 ? 'Jumlah AC terlalu besar untuk estimasi rumah tinggal.' : null,
    pumpCount: form.pumpCount > 20 ? 'Jumlah pompa terlalu besar untuk estimasi rumah tinggal.' : null
  }), [form])

  const isValid = Object.values(errors).every((item) => !item)

  function update<K extends keyof EstimateInput>(key: K, value: EstimateInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const numberField = (key: keyof EstimateInput, min: number, max: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    update(key, clampNumber(Number(e.target.value), min, max) as any)
  }

  async function onSubmit() {
    if (!isValid) return
    setLoading(true)
    setError(null)
    try {
      const res: EstimateResponse = await createEstimate(form)
      toast.success('Estimasi berhasil dihitung.')
      navigate('/result', { state: res })
    } catch (e: any) {
      const message = e?.response?.data?.error || e?.response?.data?.message || 'Gagal menghitung estimasi.'
      setError(message)
      toast.error('Gagal menghitung estimasi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Estimator instalasi listrik"
        description="Masukkan data bangunan secara bertahap. VoltCost akan menghitung rincian material, jasa, dan biaya premium dari backend agar angka UI, database, dan PDF tetap sama."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="overflow-hidden">
          <div className="border-b border-slate-200 bg-white p-4">
            <div className="grid gap-2 sm:grid-cols-4" role="tablist" aria-label="Tahap form estimasi">
              {steps.map((step, index) => (
                <button
                  key={step}
                  type="button"
                  role="tab"
                  aria-selected={activeStep === index}
                  onClick={() => setActiveStep(index)}
                  className={`rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${activeStep === index ? 'bg-sky-50 text-sky-700 ring-1 ring-sky-200' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <span className="mr-2 inline-grid h-6 w-6 place-items-center rounded-md bg-white text-xs shadow-sm">{index + 1}</span>
                  {step}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-8 p-5 sm:p-6">
            {activeStep === 0 && (
              <section className="space-y-5" role="tabpanel">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">Data bangunan dan daya</h2>
                  <p className="mt-1 text-sm text-slate-600">Gunakan luas bangunan aktual dan daya terpasang yang akan digunakan.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Luas rumah" hint="m2" error={errors.houseArea}>
                    <Input type="number" min={1} max={1000} value={form.houseArea} onChange={numberField('houseArea', 1, 1000)} />
                  </Field>
                  <Field label="Daya listrik">
                    <Select value={form.powerCapacity} onChange={(e) => update('powerCapacity', Number(e.target.value) as EstimateInput['powerCapacity'])}>
                      {capacities.map((capacity) => <option key={capacity} value={capacity}>{capacity} VA</option>)}
                    </Select>
                  </Field>
                </div>
              </section>
            )}

            {activeStep === 1 && (
              <section className="space-y-5" role="tabpanel">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">Titik instalasi standar</h2>
                  <p className="mt-1 text-sm text-slate-600">Titik lampu dan stopkontak memengaruhi kebutuhan saklar, outlet, panjang kabel, dan conduit.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Titik lampu" error={errors.lampPoints}>
                    <Input type="number" min={0} max={300} value={form.lampPoints} onChange={numberField('lampPoints', 0, 300)} />
                  </Field>
                  <Field label="Stopkontak" error={errors.socketPoints}>
                    <Input type="number" min={0} max={300} value={form.socketPoints} onChange={numberField('socketPoints', 0, 300)} />
                  </Field>
                </div>
              </section>
            )}

            {activeStep === 2 && (
              <section className="space-y-5" role="tabpanel">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">Beban khusus</h2>
                  <p className="mt-1 text-sm text-slate-600">AC dan pompa biasanya memerlukan perhatian jalur/sirkuit agar beban tidak menumpuk.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Jumlah AC" error={errors.acCount}>
                    <Input type="number" min={0} max={50} value={form.acCount} onChange={numberField('acCount', 0, 50)} />
                  </Field>
                  <Field label="Pompa air" error={errors.pumpCount}>
                    <Input type="number" min={0} max={20} value={form.pumpCount} onChange={numberField('pumpCount', 0, 20)} />
                  </Field>
                </div>
              </section>
            )}

            {activeStep === 3 && (
              <section className="space-y-5" role="tabpanel">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">Kualitas instalasi</h2>
                  <p className="mt-1 text-sm text-slate-600">Pilih standar untuk estimasi ekonomis atau premium untuk tambahan kualitas material dan pengerjaan.</p>
                </div>
                <fieldset className="grid gap-3 sm:grid-cols-2">
                  <legend className="sr-only">Pilih kualitas instalasi</legend>
                  {(['standard', 'premium'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => update('installationType', type)}
                      className={`rounded-lg border p-4 text-left transition ${form.installationType === type ? 'border-sky-300 bg-sky-50 ring-4 ring-sky-100' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="font-semibold capitalize text-slate-950">{type === 'standard' ? 'Standar' : 'Premium'}</div>
                        {form.installationType === type && <Icon name="check" className="h-5 w-5 text-sky-700" />}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{type === 'standard' ? 'Material inti dan jasa dasar.' : 'Tambahan 20% setelah material dan jasa.'}</p>
                    </button>
                  ))}
                </fieldset>
              </section>
            )}

            {error && <ErrorAlert message={error} />}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <Button tone="ghost" icon="arrowLeft" disabled={activeStep === 0} onClick={() => setActiveStep((step) => Math.max(0, step - 1))}>
                Sebelumnya
              </Button>
              <div className="flex gap-3">
                {activeStep < steps.length - 1 ? (
                  <Button icon="arrowRight" onClick={() => setActiveStep((step) => Math.min(steps.length - 1, step + 1))}>
                    Lanjut
                  </Button>
                ) : (
                  <Button icon="zap" loading={loading} disabled={!isValid} onClick={onSubmit}>
                    Hitung estimasi
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        <aside className="space-y-4">
          <StatCard label="Titik instalasi" value={estimatedPoints} icon="clipboard" subtext="Lampu, stopkontak, AC, dan pompa" />
          <StatCard label="Saran grup MCB" value={suggestedCircuits} icon="shield" subtext="Estimasi awal, dihitung final di backend" tone="neutral" />
          <Card className="p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-950">
              <Icon name="info" className="h-4 w-4 text-sky-600" />
              Ringkasan input
            </h2>
            <dl className="mt-4 grid gap-3 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Luas</dt><dd className="font-semibold text-slate-950">{form.houseArea} m2</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Daya</dt><dd className="font-semibold text-slate-950">{form.powerCapacity} VA</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Kualitas</dt><dd className="font-semibold text-slate-950">{qualityLabel}</dd></div>
            </dl>
          </Card>
          <Card className="border-amber-200 bg-amber-50 p-5">
            <div className="flex gap-3">
              <Icon name="alert" className="mt-0.5 h-5 w-5 flex-none text-amber-700" />
              <p className="text-sm leading-6 text-amber-900">
                Hasil VoltCost adalah estimasi awal. Pekerjaan final tetap perlu survei teknisi dan mengikuti ketentuan keselamatan instalasi.
              </p>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}
