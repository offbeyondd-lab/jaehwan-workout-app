import { useEffect, useState } from 'react'
import './App.css'

type Exercise = { name: string; muscle: string; sets: number; weight?: number; note?: string }
type WorkoutDay = { title: string; focus: string; exercises: Exercise[] }
type RepRecords = Record<string, string[]>
type ExerciseOverrides = Record<string, { sets: string; weight: string; unit?: 'kg' | 'lb' }>
type HistoryEntry = { id: string; name: string; date: string; week: string; day: string; sets: string | number; weight: string; unit?: 'kg' | 'lb'; reps: string[] }

type TemplateExercise = {
  id: string
  name: string
  sets: number
}

type MuscleTemplate = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  exercises: TemplateExercise[]
}

const baseWorkoutDays: WorkoutDay[] = [
  { title: 'Day 1', focus: '하체', exercises: [{ name: '레그익스텐션', muscle: '하체', sets: 3 }, { name: '레그컬', muscle: '하체', sets: 3 }, { name: '스쿼트', muscle: '하체', sets: 4, weight: 120 }, { name: '레그프레스', muscle: '하체', sets: 4 }, { name: '블스스', muscle: '하체', sets: 4 }, { name: '재환 종아리 / 효석 힙쓰러스트', muscle: '하체', sets: 4 }] },
  { title: 'Day 2', focus: '가슴 + 삼두 (밀기 운동)', exercises: [{ name: '(덤벨풀오버) (2)', muscle: '가슴', sets: 2 }, { name: '벤치프레스 (기구 or 스미스)', muscle: '가슴', sets: 4, weight: 80 }, { name: '딥스', muscle: '가슴', sets: 4 }, { name: '케이블플라이', muscle: '가슴', sets: 4 }, { name: '밀리터리프레스 or 푸쉬업', muscle: '가슴', sets: 4 }, { name: '케이블 원암 익스텐션', muscle: '삼두', sets: 4 }] },
  { title: 'Day 3', focus: '어깨 + 복근', exercises: [{ name: 'OHP (전면 고립형) (스미스)', muscle: '어깨', sets: 4 }, { name: '덤벨프레스 (전측면)', muscle: '어깨', sets: 4 }, { name: '사레레 (측면)', muscle: '어깨', sets: 4 }, { name: '사레레 (후면)', muscle: '어깨', sets: 4 }, { name: '케이블 플라이 (후면)', muscle: '어깨', sets: 4 }, { name: '업라이트로우 (측면)', muscle: '어깨', sets: 4 }, { name: '복근 루틴', muscle: '복근', sets: 3 }] },
  { title: 'Day 4', focus: '팔 + 복근', exercises: [{ name: '바벨컬', muscle: '이두', sets: 4 }, { name: '익스텐션', muscle: '삼두', sets: 4 }, { name: '케이블컬', muscle: '이두', sets: 4 }, { name: '케이블 푸쉬 다운', muscle: '삼두', sets: 4 }, { name: '해머컬', muscle: '이두', sets: 4 }, { name: '케이블 원암 익스텐션', muscle: '삼두', sets: 4 }, { name: '복근 루틴', muscle: '복근', sets: 3 }] },
  { title: 'Day 5', focus: '등 + 어깨 후면', exercises: [{ name: '렛풀다운', muscle: '등', sets: 4 }, { name: '롱풀', muscle: '등', sets: 4 }, { name: '케이블풀다운', muscle: '등', sets: 4 }, { name: '어시스트풀업 or 바벨로우', muscle: '등', sets: 4 }, { name: '루마니안데드리프트', muscle: '등', sets: 4 }, { name: '케이블 플라이 (후면)', muscle: '어깨', sets: 4 }, { name: '데드리프트', muscle: '등', sets: 4, weight: 140, note: '퇴근 후' }, { name: 'OHP', muscle: '어깨', sets: 4, weight: 60, note: '퇴근 후' }] },
  { title: 'Day 6', focus: '자율 운동', exercises: [] },
  { title: 'Day 7', focus: '자율 운동', exercises: [] },
]

const workoutDays: WorkoutDay[] = baseWorkoutDays.map((workoutDay) => {
  const exercises = [...workoutDay.exercises]
  while (exercises.length < 10) {
    exercises.push({ name: '', muscle: workoutDay.focus.split(' ')[0] || '자율', sets: 0, weight: undefined })
  }
  return { ...workoutDay, exercises }
})

const defaultTemplates: MuscleTemplate[] = [
  {
    id: 'tpl-chest',
    name: '가슴',
    createdAt: '2026.09.09',
    updatedAt: '2026.09.09',
    exercises: [
      { id: 'c1', name: '덤벨플라이', sets: 2 },
      { id: 'c2', name: '벤치프레스', sets: 4 },
      { id: 'c3', name: '딥스', sets: 4 },
      { id: 'c4', name: '케이블플라이', sets: 4 },
      { id: 'c5', name: '밀리터리프레스', sets: 4 },
      { id: 'c6', name: '푸쉬업', sets: 4 },
    ]
  },
  {
    id: 'tpl-back',
    name: '등',
    createdAt: '2026.09.09',
    updatedAt: '2026.09.09',
    exercises: [
      { id: 'b1', name: '렛풀다운', sets: 4 },
      { id: 'b2', name: '롱풀', sets: 4 },
      { id: 'b3', name: '케이블풀다운', sets: 4 },
      { id: 'b4', name: '어시스트풀업', sets: 4 },
      { id: 'b5', name: '루마니안데드리프트', sets: 4 },
      { id: 'b6', name: '데드리프트', sets: 4 },
    ]
  },
  {
    id: 'tpl-legs',
    name: '하체',
    createdAt: '2026.09.09',
    updatedAt: '2026.09.09',
    exercises: [
      { id: 'l1', name: '레그익스텐션', sets: 3 },
      { id: 'l2', name: '레그컬', sets: 3 },
      { id: 'l3', name: '스쿼트', sets: 4 },
      { id: 'l4', name: '레그프레스', sets: 4 },
      { id: 'l5', name: '블스스', sets: 4 },
      { id: 'l6', name: '힙쓰러스트', sets: 4 },
    ]
  },
  {
    id: 'tpl-shoulders',
    name: '어깨',
    createdAt: '2026.09.09',
    updatedAt: '2026.09.09',
    exercises: [
      { id: 's1', name: 'OHP', sets: 4 },
      { id: 's2', name: '덤벨프레스', sets: 4 },
      { id: 's3', name: '사레레(측면)', sets: 4 },
      { id: 's4', name: '사레레(후면)', sets: 4 },
      { id: 's5', name: '케이블플라이(후면)', sets: 4 },
      { id: 's6', name: '업라이트로우', sets: 4 },
    ]
  },
  {
    id: 'tpl-biceps',
    name: '이두',
    createdAt: '2026.09.09',
    updatedAt: '2026.09.09',
    exercises: [
      { id: 'bi1', name: '바벨컬', sets: 4 },
      { id: 'bi2', name: '케이블컬', sets: 4 },
      { id: 'bi3', name: '해머컬', sets: 4 },
      { id: 'bi4', name: '덤벨컬', sets: 4 },
    ]
  },
  {
    id: 'tpl-triceps',
    name: '삼두',
    createdAt: '2026.09.09',
    updatedAt: '2026.09.09',
    exercises: [
      { id: 't1', name: '익스텐션', sets: 4 },
      { id: 't2', name: '케이블 원암 익스텐션', sets: 4 },
      { id: 't3', name: '케이블 푸시다운', sets: 4 },
      { id: 't4', name: '딥스', sets: 4 },
    ]
  },
  {
    id: 'tpl-abs',
    name: '복근',
    createdAt: '2026.09.09',
    updatedAt: '2026.09.09',
    exercises: [
      { id: 'ab1', name: '크런치', sets: 3 },
      { id: 'ab2', name: '레그레이즈', sets: 3 },
      { id: 'ab3', name: '플랭크', sets: 3 },
    ]
  },
  {
    id: 'tpl-cardio',
    name: '유산소',
    createdAt: '2026.09.09',
    updatedAt: '2026.09.09',
    exercises: [
      { id: 'ca1', name: '러닝머신', sets: 1 },
      { id: 'ca2', name: '사이클', sets: 1 },
      { id: 'ca3', name: '천국의 계단', sets: 1 },
    ]
  }
]

const initialDayMuscles: Record<number, string[]> = {
  0: ['하체'],
  1: ['가슴', '삼두'],
  2: ['어깨', '복근'],
  3: ['이두', '삼두', '복근'],
  4: ['등', '어깨'],
  5: [],
  6: []
}

const initialDayFocuses: Record<number, string> = {
  0: '하체',
  1: '가슴 + 삼두 (밀기 운동)',
  2: '어깨 + 복근',
  3: '팔 + 복근',
  4: '등 + 어깨 후면',
  5: '자율 운동',
  6: '자율 운동'
}

const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8']
const muscleGroups = ['하체', '가슴', '등', '어깨', '이두', '삼두']
const emptyReps = () => ['', '', '', '', '']
const readStorage = <T,>(key: string, fallback: T): T => { try { return JSON.parse(localStorage.getItem(key) ?? JSON.stringify(fallback)) as T } catch { return fallback } }
const formatDate = () => new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace(/\.$/, '')

function App() {
  const [activeView, setActiveView] = useState<'workout' | 'summary' | 'template'>('workout')
  const [selectedWeek, setSelectedWeek] = useState('W1')
  const [selectedDay, setSelectedDay] = useState(0)

  // Data States
  const [reps, setReps] = useState<RepRecords>(() => readStorage('workout-reps', {}))
  const [overrides, setOverrides] = useState<ExerciseOverrides>(() => readStorage('workout-overrides', {}))
  const [names, setNames] = useState<Record<string, string>>(() => readStorage('workout-names', {}))
  const [memos, setMemos] = useState<Record<string, string>>(() => readStorage('workout-memos', {}))
  const [completed, setCompleted] = useState<Record<string, boolean>>(() => readStorage('workout-completed', {}))
  const [history, setHistory] = useState<HistoryEntry[]>(() => readStorage('workout-history', []))
  const [historyExercise, setHistoryExercise] = useState<string | null>(null)

  // Day Focus & Selected Muscle Groups State
  const [dayMuscles, setDayMuscles] = useState<Record<number, string[]>>(() => readStorage('workout-day-muscles', initialDayMuscles))
  const [dayFocuses, setDayFocuses] = useState<Record<number, string>>(() => readStorage('workout-day-focuses', initialDayFocuses))
  const [daySearchFilter, setDaySearchFilter] = useState('')
  const [showDayPicker, setShowDayPicker] = useState(true)

  // Template Management State
  const [templates, setTemplates] = useState<MuscleTemplate[]>(() => readStorage('workout-main-templates', defaultTemplates))
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(() => templates[0]?.id || '')

  // Modal / Search States
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [selectedApplyTemplateIds, setSelectedApplyTemplateIds] = useState<string[]>([])
  const [excludedApplyExerciseKeys, setExcludedApplyExerciseKeys] = useState<Record<string, boolean>>({})
  const [showAddMuscleModal, setShowAddMuscleModal] = useState(false)
  const [newMuscleNameInput, setNewMuscleNameInput] = useState('')
  const [deleteConfirmTemplate, setDeleteConfirmTemplate] = useState<MuscleTemplate | null>(null)
  const [templateSearchFilter, setTemplateSearchFilter] = useState('')

  const day = workoutDays[selectedDay]
  const currentFocus = dayFocuses[selectedDay] || day.focus
  const currentSelectedMuscles = dayMuscles[selectedDay] || []

  const keyFor = (week: string, dayIndex: number, exerciseIndex: number) => `${week}-${dayIndex}-${exerciseIndex}`
  const currentKey = (exerciseIndex: number) => keyFor(selectedWeek, selectedDay, exerciseIndex)

  const settingsFor = (exercise: Exercise, week: string, dayIndex: number, exerciseIndex: number) => {
    const override = overrides[keyFor(week, dayIndex, exerciseIndex)]
    return {
      sets: override?.sets ?? (exercise.sets ? exercise.sets.toString() : ''),
      weight: override?.weight ?? (exercise.weight?.toString() ?? ''),
      unit: override?.unit ?? 'kg'
    }
  }

  const recordsFor = (week: string, dayIndex: number, exerciseIndex: number) => {
    const value = reps[keyFor(week, dayIndex, exerciseIndex)]
    return Array.isArray(value) ? [...value, ...emptyReps()].slice(0, 5) : value ? [String(value), '', '', '', ''] : emptyReps()
  }

  const displayName = (exercise: Exercise, index: number) => names[currentKey(index)] ?? exercise.name
  const volumeFor = (exercise: Exercise, week: string, dayIndex: number, exerciseIndex: number) => {
    const settings = settingsFor(exercise, week, dayIndex, exerciseIndex)
    return recordsFor(week, dayIndex, exerciseIndex).reduce((sum, value) => sum + Number(value || 0), 0) * Number(settings.weight || 0)
  }

  const totalSummary = weeks.map((week) => muscleGroups.map((muscle) => workoutDays.reduce((sum, workoutDay, dayIndex) => sum + workoutDay.exercises.reduce((daySum, exercise, exerciseIndex) => daySum + (exercise.muscle === muscle ? volumeFor(exercise, week, dayIndex, exerciseIndex) : 0), 0), 0)))
  const summaryTotals = muscleGroups.map((_, index) => totalSummary.reduce((sum, week) => sum + week[index], 0))
  const selectedHistory = history.filter((entry) => entry.name === historyExercise)
  const configuredIndices = day.exercises
    .map((exercise, index) => ({ exercise, index }))
    .filter(({ exercise, index }) => displayName(exercise, index).trim() !== '')
    .map(({ index }) => index)

  const configuredCount = configuredIndices.length
  const completedCount = configuredIndices.filter((index) => !!completed[currentKey(index)]).length
  const isAllCompleted = configuredCount > 0 && configuredIndices.every((index) => !!completed[currentKey(index)])

  // Save Effects
  useEffect(() => localStorage.setItem('workout-reps', JSON.stringify(reps)), [reps])
  useEffect(() => localStorage.setItem('workout-overrides', JSON.stringify(overrides)), [overrides])
  useEffect(() => localStorage.setItem('workout-names', JSON.stringify(names)), [names])
  useEffect(() => localStorage.setItem('workout-memos', JSON.stringify(memos)), [memos])
  useEffect(() => localStorage.setItem('workout-completed', JSON.stringify(completed)), [completed])
  useEffect(() => localStorage.setItem('workout-history', JSON.stringify(history)), [history])
  useEffect(() => localStorage.setItem('workout-main-templates', JSON.stringify(templates)), [templates])
  useEffect(() => localStorage.setItem('workout-day-muscles', JSON.stringify(dayMuscles)), [dayMuscles])
  useEffect(() => localStorage.setItem('workout-day-focuses', JSON.stringify(dayFocuses)), [dayFocuses])

  const updateRep = (index: number, setIndex: number, value: string) => setReps((current) => { const next = [...(current[currentKey(index)] ?? emptyReps())]; next[setIndex] = value; return { ...current, [currentKey(index)]: next } })
  const updateSetting = (exercise: Exercise, index: number, field: 'sets' | 'weight' | 'unit', value: string) => setOverrides((current) => {
    const currentSettings = settingsFor(exercise, selectedWeek, selectedDay, index)
    return {
      ...current,
      [currentKey(index)]: {
        ...currentSettings,
        [field]: field === 'sets' ? (value ? Math.max(1, Number(value) || 1).toString() : '') : value
      }
    }
  })

  const toggleComplete = (index: number) => setCompleted((current) => ({ ...current, [currentKey(index)]: !current[currentKey(index)] }))

  const saveWorkoutImage = () => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) return
    canvas.width = 1200
    canvas.height = 180 + day.exercises.length * 70
    context.fillStyle = '#f5f5f0'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = '#20211e'
    context.font = '700 32px Trebuchet MS, Malgun Gothic, sans-serif'
    context.fillText(`${selectedWeek} / ${day.title}`, 40, 55)
    context.fillStyle = '#e85f48'
    context.fillText(currentFocus, 40, 100)
    context.fillStyle = '#777870'
    context.font = '700 13px Trebuchet MS, Malgun Gothic, sans-serif'
    context.fillText('EXERCISE', 40, 145); context.fillText('WEIGHT', 470, 145); context.fillText('REPS', 600, 145); context.fillText('VOLUME', 900, 145)
    day.exercises.forEach((exercise, index) => {
      const y = 180 + index * 70
      const settings = settingsFor(exercise, selectedWeek, selectedDay, index)
      const record = recordsFor(selectedWeek, selectedDay, index)
      const name = displayName(exercise, index)
      context.strokeStyle = '#dedfd9'
      context.beginPath(); context.moveTo(40, y - 25); context.lineTo(1160, y - 25); context.stroke()
      context.fillStyle = '#20211e'; context.font = '16px Trebuchet MS, Malgun Gothic, sans-serif'
      context.fillText(name || '-', 40, y + 5)
      context.fillStyle = '#777870'
      context.fillText(settings.weight ? `${settings.weight} ${settings.unit}` : '-', 470, y + 5)
      context.fillText(record.join(' / '), 600, y + 5)
      context.fillStyle = '#e85f48'
      context.fillText(`${volumeFor(exercise, selectedWeek, selectedDay, index).toLocaleString()} ${settings.unit}`, 900, y + 5)
    })
    const link = document.createElement('a')
    link.download = `LJH-${selectedWeek}-${day.title}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const finishWorkout = () => {
    if (isAllCompleted) {
      setCompleted((current) => {
        const next = { ...current }
        configuredIndices.forEach((index) => {
          next[currentKey(index)] = false
        })
        return next
      })
    } else {
      const date = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })
      const entries = configuredIndices
        .map((index) => {
          const exercise = day.exercises[index]
          const settings = settingsFor(exercise, selectedWeek, selectedDay, index)
          const name = displayName(exercise, index)
          return {
            id: `${Date.now()}-${index}`,
            name,
            date,
            week: selectedWeek,
            day: day.title,
            sets: settings.sets,
            weight: settings.weight,
            unit: settings.unit as 'kg' | 'lb',
            reps: recordsFor(selectedWeek, selectedDay, index)
          }
        })
        .filter((entry) => entry.name.trim() !== '' || entry.reps.some((r) => r !== ''))

      setHistory((current) => [...entries, ...current])
      setCompleted((current) => {
        const next = { ...current }
        configuredIndices.forEach((index) => {
          next[currentKey(index)] = true
        })
        return next
      })
    }
  }

  // --- Day Main Muscle Chip Toggle Handler ---
  const handleToggleDayMuscle = (muscleName: string) => {
    const currentList = dayMuscles[selectedDay] || []
    let nextList: string[] = []
    if (currentList.includes(muscleName)) {
      nextList = currentList.filter((m) => m !== muscleName)
    } else {
      nextList = [...currentList, muscleName]
    }

    const nextFocus = nextList.length > 0 ? nextList.join(' + ') : '자율 운동'

    setDayMuscles((prev) => ({ ...prev, [selectedDay]: nextList }))
    setDayFocuses((prev) => ({ ...prev, [selectedDay]: nextFocus }))
  }

  // --- Apply Selected Muscles to Exercises & Close Picker ---
  const handleApplyDayPicker = () => {
    const currentList = dayMuscles[selectedDay] || []
    const combinedExercises: { name: string; sets: number }[] = []
    currentList.forEach((mName) => {
      const tpl = templates.find((t) => t.name === mName)
      if (tpl) {
        tpl.exercises.forEach((ex) => {
          if (ex.name.trim() !== '') {
            combinedExercises.push({ name: ex.name, sets: ex.sets })
          }
        })
      }
    })

    if (currentList.length > 0) {
      const newNames: Record<string, string> = { ...names }
      const newOverrides: ExerciseOverrides = { ...overrides }

      for (let i = 0; i < 10; i++) {
        const key = currentKey(i)
        if (i < combinedExercises.length) {
          const item = combinedExercises[i]
          newNames[key] = item.name
          newOverrides[key] = {
            sets: item.sets.toString(),
            weight: overrides[key]?.weight ?? '',
            unit: overrides[key]?.unit ?? 'kg'
          }
        } else {
          newNames[key] = ''
          newOverrides[key] = { sets: '', weight: '', unit: 'kg' }
        }
      }

      setNames(newNames)
      setOverrides(newOverrides)
    }

    setShowDayPicker(false)
  }

  // --- Apply Selected Muscles across ALL WEEKS for current Day ---
  const handleApplyDayPickerToAllWeeks = () => {
    const currentList = dayMuscles[selectedDay] || []
    const combinedExercises: { name: string; sets: number }[] = []
    currentList.forEach((mName) => {
      const tpl = templates.find((t) => t.name === mName)
      if (tpl) {
        tpl.exercises.forEach((ex) => {
          if (ex.name.trim() !== '') {
            combinedExercises.push({ name: ex.name, sets: ex.sets })
          }
        })
      }
    })

    if (currentList.length > 0) {
      const newNames: Record<string, string> = { ...names }
      const newOverrides: ExerciseOverrides = { ...overrides }

      weeks.forEach((week) => {
        for (let i = 0; i < 10; i++) {
          const key = keyFor(week, selectedDay, i)
          if (i < combinedExercises.length) {
            const item = combinedExercises[i]
            newNames[key] = item.name
            newOverrides[key] = {
              sets: item.sets.toString(),
              weight: overrides[key]?.weight ?? '',
              unit: overrides[key]?.unit ?? 'kg'
            }
          } else {
            newNames[key] = ''
            newOverrides[key] = { sets: '', weight: '', unit: 'kg' }
          }
        }
      })

      setNames(newNames)
      setOverrides(newOverrides)
    }

    setShowDayPicker(false)
  }

  // --- Select Day Handler ---
  const handleSelectDay = (dayIndex: number) => {
    setSelectedDay(dayIndex)
    setShowDayPicker(true)
  }

  // --- Template Management Functions ---
  const activeTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0]

  const handleAddMuscleGroup = () => {
    const trimmed = newMuscleNameInput.trim()
    if (!trimmed) return
    if (templates.some((t) => t.name === trimmed)) {
      alert('이미 존재하는 부위명입니다.')
      return
    }
    const newTpl: MuscleTemplate = {
      id: `tpl-${Date.now()}`,
      name: trimmed,
      createdAt: formatDate(),
      updatedAt: formatDate(),
      exercises: []
    }
    setTemplates((current) => [...current, newTpl])
    setSelectedTemplateId(newTpl.id)
    setNewMuscleNameInput('')
    setShowAddMuscleModal(false)
  }

  const handleDeleteMuscleGroup = (tpl: MuscleTemplate) => {
    setTemplates((current) => current.filter((t) => t.id !== tpl.id))
    if (selectedTemplateId === tpl.id) {
      const remaining = templates.filter((t) => t.id !== tpl.id)
      setSelectedTemplateId(remaining[0]?.id || '')
    }
    setDeleteConfirmTemplate(null)
  }

  const handleAddExerciseToTemplate = (templateId: string) => {
    setTemplates((current) => current.map((tpl) => {
      if (tpl.id !== templateId) return tpl
      if (tpl.exercises.length >= 7) {
        alert('부위당 최대 7개 운동까지 등록 가능합니다.')
        return tpl
      }
      const newEx: TemplateExercise = {
        id: `ex-${Date.now()}`,
        name: '',
        sets: 4
      }
      return {
        ...tpl,
        updatedAt: formatDate(),
        exercises: [...tpl.exercises, newEx]
      }
    }))
  }

  const handleUpdateTemplateExercise = (templateId: string, exerciseId: string, field: 'name' | 'sets', value: string | number) => {
    setTemplates((current) => current.map((tpl) => {
      if (tpl.id !== templateId) return tpl
      return {
        ...tpl,
        updatedAt: formatDate(),
        exercises: tpl.exercises.map((ex) => {
          if (ex.id !== exerciseId) return ex
          return {
            ...ex,
            [field]: field === 'sets' ? Math.max(1, Number(value) || 1) : value
          }
        })
      }
    }))
  }

  const handleDeleteTemplateExercise = (templateId: string, exerciseId: string) => {
    setTemplates((current) => current.map((tpl) => {
      if (tpl.id !== templateId) return tpl
      return {
        ...tpl,
        updatedAt: formatDate(),
        exercises: tpl.exercises.filter((ex) => ex.id !== exerciseId)
      }
    }))
  }

  const handleReorderTemplateExercise = (templateId: string, index: number, direction: 'up' | 'down') => {
    setTemplates((current) => current.map((tpl) => {
      if (tpl.id !== templateId) return tpl
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= tpl.exercises.length) return tpl
      const nextEx = [...tpl.exercises]
      const temp = nextEx[index]
      nextEx[index] = nextEx[targetIndex]
      nextEx[targetIndex] = temp
      return {
        ...tpl,
        updatedAt: formatDate(),
        exercises: nextEx
      }
    }))
  }

  // Candidate exercises for template apply modal
  const candidateApplyExercises = selectedApplyTemplateIds.flatMap((tplId) => {
    const tpl = templates.find((t) => t.id === tplId)
    if (!tpl) return []
    return tpl.exercises
      .filter((e) => e.name.trim() !== '')
      .map((ex, idx) => ({
        key: `${tpl.id}-${ex.id || idx}-${ex.name}`,
        tplId: tpl.id,
        tplName: tpl.name,
        name: ex.name,
        sets: ex.sets
      }))
  })

  const includedApplyExercises = candidateApplyExercises.filter((ex) => !excludedApplyExerciseKeys[ex.key])

  // --- Day View Template Application Modal ---
  const handleOpenApplyModal = () => {
    setSelectedApplyTemplateIds([])
    setExcludedApplyExerciseKeys({})
    setShowApplyModal(true)
  }

  const handleToggleApplyTemplate = (templateId: string) => {
    setSelectedApplyTemplateIds((current) =>
      current.includes(templateId) ? current.filter((id) => id !== templateId) : [...current, templateId]
    )
  }

  const handleApplyTemplatesToDay = () => {
    if (includedApplyExercises.length === 0) {
      alert('적용할 운동을 하나 이상 선택해주세요.')
      return
    }

    const exercisesToApply = includedApplyExercises.slice(0, 10)
    const selectedMuscleNames = Array.from(new Set(exercisesToApply.map((e) => e.tplName)))

    const newNames: Record<string, string> = { ...names }
    const newOverrides: ExerciseOverrides = { ...overrides }

    for (let i = 0; i < 10; i++) {
      const key = currentKey(i)
      if (i < exercisesToApply.length) {
        const item = exercisesToApply[i]
        newNames[key] = item.name
        newOverrides[key] = {
          sets: item.sets.toString(),
          weight: overrides[key]?.weight ?? '',
          unit: overrides[key]?.unit ?? 'kg'
        }
      } else {
        newNames[key] = ''
        newOverrides[key] = { sets: '', weight: '', unit: 'kg' }
      }
    }

    if (selectedMuscleNames.length > 0) {
      setDayMuscles((prev) => ({ ...prev, [selectedDay]: selectedMuscleNames }))
      setDayFocuses((prev) => ({ ...prev, [selectedDay]: selectedMuscleNames.join(' + ') }))
    }

    setNames(newNames)
    setOverrides(newOverrides)
    setShowApplyModal(false)
  }

  // Filter templates for search/chip bar in Template Setting
  const filteredTemplates = templates.filter((tpl) =>
    templateSearchFilter.trim() === '' || tpl.name.includes(templateSearchFilter) || tpl.exercises.some((e) => e.name.includes(templateSearchFilter))
  )

  const dayFilteredTemplates = templates.filter((tpl) =>
    daySearchFilter.trim() === '' || tpl.name.includes(daySearchFilter) || tpl.exercises.some((e) => e.name.includes(daySearchFilter))
  )

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-mark">LJH <span>TRAINING LOG</span></div>
        <div className="topbar-actions">
          <div className="topbar-meta"><span className="status-dot" /> 점심 운동 기록</div>
          <button className="save-image-button" onClick={saveWorkoutImage}>기록 저장 ↓</button>
        </div>
      </header>

      <section className="intro">
        <div>
          <p className="eyebrow">2026 PROGRAM / REV.A</p>
          <h1>오늘의 운동을<br /><em>정확하게 기록하세요.</em></h1>
          <p className="intro-copy">엑셀 루틴과 메인 운동 템플릿을 바탕으로 만든 8주 운동 로그입니다.<br />템플릿으로 운동 목록을 채우고 반복 수를 기록해보세요.</p>
        </div>
        <div className="week-selector">
          <button
            className={activeView === 'template' ? 'template-active' : ''}
            onClick={() => setActiveView('template')}
          >
            MAIN WORKOUT SETTING
          </button>
          <button
            className={activeView === 'summary' ? 'total-active' : ''}
            onClick={() => setActiveView('summary')}
          >
            TOTAL SUMMARY
          </button>
          {weeks.map((week) => (
            <button
              className={activeView === 'workout' && selectedWeek === week ? 'active' : ''}
              key={week}
              onClick={() => { setSelectedWeek(week); setActiveView('workout') }}
            >
              {week}
            </button>
          ))}
        </div>
      </section>

      {/* --- VIEW 1: TEMPLATE SETTING VIEW --- */}
      {activeView === 'template' ? (
        <section className="template-setting-container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">TEMPLATE MANAGEMENT</p>
              <h2>Main Workout Setting</h2>
            </div>
            <button className="add-muscle-btn" onClick={() => setShowAddMuscleModal(true)}>
              + 새로운 부위 추가
            </button>
          </div>

          <div className="template-search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Main 운동 추가 하세요."
              value={templateSearchFilter}
              onChange={(e) => setTemplateSearchFilter(e.target.value)}
            />
          </div>

          <div className="muscle-chips-row">
            {filteredTemplates.map((tpl) => (
              <button
                key={tpl.id}
                className={`muscle-chip ${selectedTemplateId === tpl.id ? 'active' : ''}`}
                onClick={() => setSelectedTemplateId(tpl.id)}
              >
                {tpl.name}
              </button>
            ))}
          </div>

          {activeTemplate ? (
            <div className="template-editor-card">
              <div className="template-card-header">
                <div>
                  <h3>{activeTemplate.name} 템플릿</h3>
                  <p className="template-dates">
                    <span>생성일: {activeTemplate.createdAt}</span>
                    <span>수정일: {activeTemplate.updatedAt}</span>
                  </p>
                </div>
                <div className="template-card-actions">
                  <button
                    className="add-ex-btn"
                    disabled={activeTemplate.exercises.length >= 7}
                    onClick={() => handleAddExerciseToTemplate(activeTemplate.id)}
                  >
                    + 운동 추가 ({activeTemplate.exercises.length}/7)
                  </button>
                  <button
                    className="delete-tpl-btn"
                    onClick={() => setDeleteConfirmTemplate(activeTemplate)}
                  >
                    부위 삭제
                  </button>
                </div>
              </div>

              <div className="template-table-wrap">
                <table className="template-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>순서</th>
                      <th style={{ width: '80px' }}>이동</th>
                      <th>운동명</th>
                      <th style={{ width: '130px' }}>목표 세트</th>
                      <th style={{ width: '80px' }}>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeTemplate.exercises.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="empty-row">
                          등록된 운동이 없습니다. '+ 운동 추가' 버튼을 눌러 운동을 등록하세요.
                        </td>
                      </tr>
                    ) : (
                      activeTemplate.exercises.map((ex, idx) => (
                        <tr key={ex.id}>
                          <td className="center-text">{idx + 1}.</td>
                          <td className="center-text">
                            <button
                              className="order-btn"
                              disabled={idx === 0}
                              onClick={() => handleReorderTemplateExercise(activeTemplate.id, idx, 'up')}
                            >
                              ▲
                            </button>
                            <button
                              className="order-btn"
                              disabled={idx === activeTemplate.exercises.length - 1}
                              onClick={() => handleReorderTemplateExercise(activeTemplate.id, idx, 'down')}
                            >
                              ▼
                            </button>
                          </td>
                          <td>
                            <input
                              className="template-ex-name-input"
                              type="text"
                              placeholder="운동명 입력 (예: 벤치프레스)"
                              value={ex.name}
                              onChange={(e) => handleUpdateTemplateExercise(activeTemplate.id, ex.id, 'name', e.target.value)}
                            />
                          </td>
                          <td>
                            <div className="sets-input-wrap">
                              <input
                                className="template-sets-input"
                                type="number"
                                min="1"
                                value={ex.sets}
                                onChange={(e) => handleUpdateTemplateExercise(activeTemplate.id, ex.id, 'sets', e.target.value)}
                              />
                              <span>세트</span>
                            </div>
                          </td>
                          <td className="center-text">
                            <button
                              className="delete-ex-row-btn"
                              onClick={() => handleDeleteTemplateExercise(activeTemplate.id, ex.id)}
                            >
                              삭제
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="template-guide-box">
                <p>💡 <strong>템플릿 사용 안내</strong></p>
                <ul>
                  <li>부위당 최대 7개 운동까지 등록할 수 있습니다.</li>
                  <li>여기서 편집한 템플릿은 원본으로 안전하게 보존됩니다.</li>
                  <li>Day에서 템플릿을 불러오더라도, Day의 개별 수정이 원본 템플릿을 변경하지 않습니다.</li>
                </ul>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {/* --- VIEW 2: TOTAL SUMMARY VIEW --- */}
      {activeView === 'summary' ? (
        <section className="total-summary">
          <div className="section-heading">
            <div>
              <p className="eyebrow">VOLUME SHEET</p>
              <h2>TOTAL VOLUME SUMMARY</h2>
            </div>
            <span className="progress-label">W1 - W8</span>
          </div>
          <div className="summary-table-wrap">
            <table className="summary-table">
              <thead>
                <tr>
                  <th>WEEK</th>
                  {muscleGroups.map((muscle) => <th key={muscle}>{muscle}</th>)}
                  <th>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {totalSummary.map((values, index) => (
                  <tr key={weeks[index]}>
                    <th>{weeks[index]}</th>
                    {values.map((value, valueIndex) => (
                      <td key={muscleGroups[valueIndex]}>{value.toLocaleString()}</td>
                    ))}
                    <td className="row-total">{values.reduce((sum, value) => sum + value, 0).toLocaleString()}</td>
                  </tr>
                ))}
                <tr className="grand-total">
                  <th>TOTAL</th>
                  {summaryTotals.map((value, index) => (
                    <td key={muscleGroups[index]}>{value.toLocaleString()}</td>
                  ))}
                  <td>{summaryTotals.reduce((sum, value) => sum + value, 0).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="summary-note">각 주차 운동 기록의 중량 × 5세트 반복 합계를 부위별로 집계합니다.</p>
        </section>
      ) : null}

      {/* --- VIEW 3: WORKOUT LOG DAY VIEW --- */}
      {activeView === 'workout' ? (
        <>
          <nav className="day-tabs">
            {workoutDays.map((workout, index) => (
              <button
                className={selectedDay === index ? 'active' : ''}
                key={workout.title}
                onClick={() => handleSelectDay(index)}
              >
                <span>{workout.title}</span>
                <strong>{dayFocuses[index] || workout.focus}</strong>
              </button>
            ))}
          </nav>

          {/* Main Muscle Group Picker Section with '반영' & '모든 WEEK에 적용' buttons */}
          {showDayPicker ? (
            <section className="day-main-picker-card">
              <div className="day-picker-search-row">
                <div className="template-search-bar">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="Main 운동 추가 하세요."
                    value={daySearchFilter}
                    onChange={(e) => setDaySearchFilter(e.target.value)}
                  />
                </div>
                <button className="day-picker-reflect-btn" onClick={handleApplyDayPicker}>
                  반영
                </button>
              </div>
              <div className="muscle-chips-row">
                {dayFilteredTemplates.map((tpl) => {
                  const isSelected = currentSelectedMuscles.includes(tpl.name)
                  return (
                    <button
                      key={tpl.id}
                      className={`muscle-chip ${isSelected ? 'active' : ''}`}
                      onClick={() => handleToggleDayMuscle(tpl.name)}
                    >
                      {tpl.name}
                    </button>
                  )
                })}
                <button className="apply-all-weeks-btn" onClick={handleApplyDayPickerToAllWeeks}>
                  모든 WEEK에 적용
                </button>
              </div>
            </section>
          ) : null}

          <section className="workout-layout">
            <div className="workout-main">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">{selectedWeek} / {day.title}</p>
                  <h2>{currentFocus}</h2>
                </div>
                <div className="heading-right-group">
                  <button className="load-template-btn" onClick={handleOpenApplyModal}>
                    📋 상세 템플릿 목록
                  </button>
                  <span className="progress-label">{completedCount} / {configuredCount} 완료</span>
                </div>
              </div>

              <div className="exercise-list">
                {day.exercises.map((exercise, index) => {
                  const key = currentKey(index)
                  const name = displayName(exercise, index)
                  const hasName = name.trim() !== ''
                  const settings = settingsFor(exercise, selectedWeek, selectedDay, index)
                  const record = recordsFor(selectedWeek, selectedDay, index)
                  const volume = volumeFor(exercise, selectedWeek, selectedDay, index)
                  return (
                    <article className={`exercise-row ${hasName ? 'has-exercise' : 'is-empty-slot'} ${completed[key] ? 'is-complete' : ''}`} key={key}>
                      <button className="check-button" onClick={() => toggleComplete(index)}>
                        {completed[key] ? '✓' : String(index + 1).padStart(2, '0')}
                      </button>

                      <div className="exercise-info">
                        <div className="exercise-title-line">
                          <input
                            className="exercise-name-input"
                            placeholder="운동종목 입력"
                            value={name}
                            onChange={(event) => setNames((current) => ({ ...current, [key]: event.target.value }))}
                          />
                          {name ? (
                            <button className="history-button" onClick={() => setHistoryExercise(name)}>
                              History
                            </button>
                          ) : null}
                        </div>
                        <span>{exercise.muscle}{exercise.note ? ` · ${exercise.note}` : ''}</span>
                      </div>

                      <label className="target editable-field">
                        <small>목표 세트</small>
                        <input
                          type="number"
                          min="1"
                          placeholder="-"
                          value={settings.sets}
                          onChange={(event) => updateSetting(exercise, index, 'sets', event.target.value)}
                        />
                      </label>

                      <label className="target weight editable-field">
                        <small>기준 중량</small>
                        <div className="weight-input-wrap">
                          <input
                            inputMode="decimal"
                            value={settings.weight}
                            placeholder="-"
                            onChange={(event) => updateSetting(exercise, index, 'weight', event.target.value)}
                          />
                          <button
                            type="button"
                            className="unit-toggle-btn"
                            title="단위 변경 (kg / lb)"
                            onClick={() => updateSetting(exercise, index, 'unit', settings.unit === 'kg' ? 'lb' : 'kg')}
                          >
                            {settings.unit}
                          </button>
                        </div>
                      </label>

                      <div className="reps-input">
                        <small>Reps Record</small>
                        <div className="rep-grid">
                          {record.map((value, setIndex) => (
                            <input
                              key={setIndex}
                              placeholder={`S${setIndex + 1}`}
                              value={value}
                              onChange={(event) => updateRep(index, setIndex, event.target.value)}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="volume-cell">
                        <small>볼륨</small>
                        <strong>{volume.toLocaleString()}<b> {settings.unit}</b></strong>
                      </div>

                      <label className="memo-field">
                        <small>Memo</small>
                        <input
                          placeholder="특이 사항"
                          value={memos[key] ?? ''}
                          onChange={(event) => setMemos((current) => ({ ...current, [key]: event.target.value }))}
                        />
                      </label>
                    </article>
                  )
                })}
              </div>
            </div>

            <aside className="summary-panel">
              <button className="finish-button" onClick={finishWorkout}>
                {isAllCompleted ? '운동 완료 해제' : '운동 완료 처리'} <span>→</span>
              </button>
            </aside>
          </section>
        </>
      ) : null}

      <footer>
        <span>LJH TRAINING LOG · v1.0.0</span>
        <span>입력 내용은 이 브라우저에 자동 저장됩니다.</span>
      </footer>

      {/* --- MODAL 1: EXERCISE HISTORY MODAL --- */}
      {historyExercise ? (
        <div className="history-backdrop" onClick={() => setHistoryExercise(null)}>
          <section className="history-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <button className="history-close" onClick={() => setHistoryExercise(null)}>×</button>
            <div className="history-modal-head">
              <p className="eyebrow">EXERCISE HISTORY</p>
              <h2>{historyExercise}</h2>
              <div className="history-tabs">
                <strong>History</strong>
              </div>
            </div>
            {selectedHistory.length === 0 ? (
              <p className="history-empty">
                아직 저장된 이전 기록이 없습니다.<br />
                운동 완료 처리 후 기록이 여기에 표시됩니다.
              </p>
            ) : (
              <div className="history-list">
                {selectedHistory.map((entry) => (
                  <article className="history-card" key={entry.id}>
                    <div className="history-card-top">
                      <strong>{entry.week} {entry.day}</strong>
                      <span>{entry.date}</span>
                    </div>
                    <div className="history-labels">
                      <span>Sets</span>
                      <span>Completed</span>
                      <span>Target</span>
                    </div>
                    {entry.reps.map((rep, index) => (
                      <div className="history-set" key={index}>
                        <span>{index + 1}</span>
                        <strong>{entry.weight ? `${entry.weight} ${entry.unit || 'kg'} × ${rep || '-'}` : rep || '-'}</strong>
                        <span>{entry.weight ? `${entry.weight} ${entry.unit || 'kg'}` : '-'}</span>
                      </div>
                    ))}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}

      {/* --- MODAL 2: APPLY TEMPLATES MODAL --- */}
      {showApplyModal ? (
        <div className="history-backdrop" onClick={() => setShowApplyModal(false)}>
          <section className="history-modal template-apply-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <button className="history-close" onClick={() => setShowApplyModal(false)}>×</button>
            <div className="history-modal-head">
              <p className="eyebrow">TEMPLATE LOADER</p>
              <h2>Main Workout Template 불러오기</h2>
            </div>
            <div className="apply-modal-body">
              <p className="apply-desc">
                선택한 부위 템플릿의 운동과 목표 세트 수가 <strong>{selectedWeek} / {day.title}</strong>에 순서대로 복사됩니다.<br />
                (복수 선택 지원, 최대 10개 운동 자동 나열)
              </p>

              <div className="template-checkbox-grid">
                {templates.map((tpl) => (
                  <label key={tpl.id} className={`tpl-checkbox-card ${selectedApplyTemplateIds.includes(tpl.id) ? 'checked' : ''}`}>
                    <input
                      type="checkbox"
                      checked={selectedApplyTemplateIds.includes(tpl.id)}
                      onChange={() => handleToggleApplyTemplate(tpl.id)}
                    />
                    <div className="tpl-card-info">
                      <strong>{tpl.name}</strong>
                      <span>({tpl.exercises.filter((e) => e.name.trim()).length}개 운동)</span>
                    </div>
                  </label>
                ))}
              </div>

              <div className="apply-preview-box">
                <div className="preview-box-header">
                  <p className="eyebrow">
                    불러올 운동 순서 미리보기 ({includedApplyExercises.length}개 선택됨 / 최대 10개 반영)
                  </p>
                  {candidateApplyExercises.length > 0 && (
                    <button
                      type="button"
                      className="preview-reset-btn"
                      onClick={() => setExcludedApplyExerciseKeys({})}
                    >
                      전체 선택 / 초기화
                    </button>
                  )}
                </div>

                {candidateApplyExercises.length === 0 ? (
                  <p className="preview-empty">선택된 템플릿이 없습니다. 위에서 부위를 선택하세요.</p>
                ) : (
                  <div className="preview-items-grid">
                    {candidateApplyExercises.map((ex) => {
                      const isExcluded = !!excludedApplyExerciseKeys[ex.key]
                      const activeIndex = includedApplyExercises.findIndex((item) => item.key === ex.key)

                      return (
                        <div
                          key={ex.key}
                          className={`preview-item-card ${isExcluded ? 'excluded' : 'included'}`}
                        >
                          <label className="preview-item-label">
                            <input
                              type="checkbox"
                              checked={!isExcluded}
                              onChange={() => {
                                setExcludedApplyExerciseKeys((prev) => ({
                                  ...prev,
                                  [ex.key]: !prev[ex.key]
                                }))
                              }}
                            />
                            <span className="preview-ex-num">
                              {!isExcluded ? `${activeIndex + 1}.` : '•'}
                            </span>
                            <span className="preview-tpl-tag">[{ex.tplName}]</span>
                            <strong className="preview-ex-name">{ex.name}</strong>
                            <span className="preview-ex-sets">({ex.sets}세트)</span>
                          </label>

                          <button
                            type="button"
                            className="preview-item-delete-btn"
                            title="운동 제외/삭제"
                            onClick={() => {
                              setExcludedApplyExerciseKeys((prev) => ({
                                ...prev,
                                [ex.key]: !prev[ex.key]
                              }))
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="modal-btn-row">
                <button className="apply-action-btn" onClick={handleApplyTemplatesToDay}>
                  선택한 템플릿 적용하기
                </button>
                <button className="cancel-action-btn" onClick={() => setShowApplyModal(false)}>
                  취소
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {/* --- MODAL 3: ADD MUSCLE GROUP MODAL --- */}
      {showAddMuscleModal ? (
        <div className="history-backdrop" onClick={() => setShowAddMuscleModal(false)}>
          <section className="history-modal small-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <button className="history-close" onClick={() => setShowAddMuscleModal(false)}>×</button>
            <div className="history-modal-head">
              <p className="eyebrow">NEW MUSCLE GROUP</p>
              <h2>새로운 운동 부위 추가</h2>
            </div>
            <div className="apply-modal-body">
              <p className="apply-desc">템플릿으로 관리할 부위명을 입력하세요 (예: 복근, 전완, 둔근, 약점보완).</p>
              <input
                type="text"
                className="modal-text-input"
                placeholder="부위명 입력"
                value={newMuscleNameInput}
                onChange={(e) => setNewMuscleNameInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddMuscleGroup() }}
              />
              <div className="modal-btn-row">
                <button className="apply-action-btn" onClick={handleAddMuscleGroup}>
                  부위 추가하기
                </button>
                <button className="cancel-action-btn" onClick={() => setShowAddMuscleModal(false)}>
                  취소
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {/* --- MODAL 4: DELETE CONFIRMATION MODAL --- */}
      {deleteConfirmTemplate ? (
        <div className="history-backdrop" onClick={() => setDeleteConfirmTemplate(null)}>
          <section className="history-modal small-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <button className="history-close" onClick={() => setDeleteConfirmTemplate(null)}>×</button>
            <div className="history-modal-head">
              <p className="eyebrow">DELETE CONFIRMATION</p>
              <h2>부위 템플릿 삭제</h2>
            </div>
            <div className="apply-modal-body">
              <p className="apply-desc">
                정말 <strong>'{deleteConfirmTemplate.name}'</strong> 템플릿을 삭제하시겠습니까?<br />
                삭제하면 해당 원본 템플릿 정보가 제거됩니다.
              </p>
              <div className="modal-btn-row">
                <button className="danger-action-btn" onClick={() => handleDeleteMuscleGroup(deleteConfirmTemplate)}>
                  삭제하기
                </button>
                <button className="cancel-action-btn" onClick={() => setDeleteConfirmTemplate(null)}>
                  취소
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}

    </main>
  )
}

export default App
