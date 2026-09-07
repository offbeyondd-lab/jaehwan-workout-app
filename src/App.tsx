import { useEffect, useState } from 'react'
import './App.css'

type Exercise = { name: string; muscle: string; sets: number; weight?: number; note?: string }
type WorkoutDay = { title: string; focus: string; exercises: Exercise[] }
type RepRecords = Record<string, string[]>
type ExerciseOverrides = Record<string, { sets: number; weight: string }>
type HistoryEntry = { id: string; name: string; date: string; week: string; day: string; sets: number; weight: string; reps: string[] }

const workoutDays: WorkoutDay[] = [
  { title: 'Day 1', focus: '하체', exercises: [{ name: '레그익스텐션', muscle: '하체', sets: 3 }, { name: '레그컬', muscle: '하체', sets: 3 }, { name: '스쿼트', muscle: '하체', sets: 4, weight: 120 }, { name: '레그프레스', muscle: '하체', sets: 4 }, { name: '블스스', muscle: '하체', sets: 4 }, { name: '재환 종아리 / 효석 힙쓰러스트', muscle: '하체', sets: 4 }] },
  { title: 'Day 2', focus: '가슴 + 삼두 (밀기 운동)', exercises: [{ name: '(덤벨풀오버) (2)', muscle: '가슴', sets: 2 }, { name: '벤치프레스 (기구 or 스미스)', muscle: '가슴', sets: 4, weight: 80 }, { name: '딥스', muscle: '가슴', sets: 4 }, { name: '케이블플라이', muscle: '가슴', sets: 4 }, { name: '밀리터리프레스 or 푸쉬업', muscle: '가슴', sets: 4 }, { name: '케이블 원암 익스텐션', muscle: '삼두', sets: 4 }] },
  { title: 'Day 3', focus: '어깨 + 복근', exercises: [{ name: 'OHP (전면 고립형) (스미스)', muscle: '어깨', sets: 4 }, { name: '덤벨프레스 (전측면)', muscle: '어깨', sets: 4 }, { name: '사레레 (측면)', muscle: '어깨', sets: 4 }, { name: '사레레 (후면)', muscle: '어깨', sets: 4 }, { name: '케이블 플라이 (후면)', muscle: '어깨', sets: 4 }, { name: '업라이트로우 (측면)', muscle: '어깨', sets: 4 }, { name: '복근 루틴', muscle: '복근', sets: 3 }] },
  { title: 'Day 4', focus: '팔 + 복근', exercises: [{ name: '바벨컬', muscle: '이두', sets: 4 }, { name: '익스텐션', muscle: '삼두', sets: 4 }, { name: '케이블컬', muscle: '이두', sets: 4 }, { name: '케이블 푸쉬 다운', muscle: '삼두', sets: 4 }, { name: '해머컬', muscle: '이두', sets: 4 }, { name: '케이블 원암 익스텐션', muscle: '삼두', sets: 4 }, { name: '복근 루틴', muscle: '복근', sets: 3 }] },
  { title: 'Day 5', focus: '등 + 어깨 후면', exercises: [{ name: '렛풀다운', muscle: '등', sets: 4 }, { name: '롱풀', muscle: '등', sets: 4 }, { name: '케이블풀다운', muscle: '등', sets: 4 }, { name: '어시스트풀업 or 바벨로우', muscle: '등', sets: 4 }, { name: '루마니안데드리프트', muscle: '등', sets: 4 }, { name: '케이블 플라이 (후면)', muscle: '어깨', sets: 4 }, { name: '데드리프트', muscle: '등', sets: 4, weight: 140, note: '퇴근 후' }, { name: 'OHP', muscle: '어깨', sets: 4, weight: 60, note: '퇴근 후' }] },
]
const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8']
const muscleGroups = ['하체', '가슴', '등', '어깨', '이두', '삼두']
const emptyReps = () => ['', '', '', '', '']
const readStorage = <T,>(key: string, fallback: T): T => { try { return JSON.parse(localStorage.getItem(key) ?? JSON.stringify(fallback)) as T } catch { return fallback } }

function App() {
  const [selectedWeek, setSelectedWeek] = useState('W1')
  const [selectedDay, setSelectedDay] = useState(0)
  const [showTotalSummary, setShowTotalSummary] = useState(false)
  const [reps, setReps] = useState<RepRecords>(() => readStorage('workout-reps', {}))
  const [overrides, setOverrides] = useState<ExerciseOverrides>(() => readStorage('workout-overrides', {}))
  const [names, setNames] = useState<Record<string, string>>(() => readStorage('workout-names', {}))
  const [memos, setMemos] = useState<Record<string, string>>(() => readStorage('workout-memos', {}))
  const [completed, setCompleted] = useState<Record<string, boolean>>(() => readStorage('workout-completed', {}))
  const [history, setHistory] = useState<HistoryEntry[]>(() => readStorage('workout-history', []))
  const [historyExercise, setHistoryExercise] = useState<string | null>(null)
  const day = workoutDays[selectedDay]
  const keyFor = (week: string, dayIndex: number, exerciseIndex: number) => `${week}-${dayIndex}-${exerciseIndex}`
  const currentKey = (exerciseIndex: number) => keyFor(selectedWeek, selectedDay, exerciseIndex)
  const settingsFor = (exercise: Exercise, week: string, dayIndex: number, exerciseIndex: number) => overrides[keyFor(week, dayIndex, exerciseIndex)] ?? { sets: exercise.sets, weight: exercise.weight?.toString() ?? '' }
  const recordsFor = (week: string, dayIndex: number, exerciseIndex: number) => { const value = reps[keyFor(week, dayIndex, exerciseIndex)]; return Array.isArray(value) ? [...value, ...emptyReps()].slice(0, 5) : value ? [String(value), '', '', '', ''] : emptyReps() }
  const displayName = (exercise: Exercise, index: number) => names[currentKey(index)] ?? exercise.name
  const volumeFor = (exercise: Exercise, week: string, dayIndex: number, exerciseIndex: number) => { const settings = settingsFor(exercise, week, dayIndex, exerciseIndex); return recordsFor(week, dayIndex, exerciseIndex).reduce((sum, value) => sum + Number(value || 0), 0) * Number(settings.weight || 0) }
  const totalSummary = weeks.map((week) => muscleGroups.map((muscle) => workoutDays.reduce((sum, workoutDay, dayIndex) => sum + workoutDay.exercises.reduce((daySum, exercise, exerciseIndex) => daySum + (exercise.muscle === muscle ? volumeFor(exercise, week, dayIndex, exerciseIndex) : 0), 0), 0)))
  const summaryTotals = muscleGroups.map((_, index) => totalSummary.reduce((sum, week) => sum + week[index], 0))
  const selectedHistory = history.filter((entry) => entry.name === historyExercise)
  const completedCount = day.exercises.filter((_, index) => completed[currentKey(index)]).length

  useEffect(() => localStorage.setItem('workout-reps', JSON.stringify(reps)), [reps])
  useEffect(() => localStorage.setItem('workout-overrides', JSON.stringify(overrides)), [overrides])
  useEffect(() => localStorage.setItem('workout-names', JSON.stringify(names)), [names])
  useEffect(() => localStorage.setItem('workout-memos', JSON.stringify(memos)), [memos])
  useEffect(() => localStorage.setItem('workout-completed', JSON.stringify(completed)), [completed])
  useEffect(() => localStorage.setItem('workout-history', JSON.stringify(history)), [history])

  const updateRep = (index: number, setIndex: number, value: string) => setReps((current) => { const next = [...(current[currentKey(index)] ?? emptyReps())]; next[setIndex] = value; return { ...current, [currentKey(index)]: next } })
  const updateSetting = (exercise: Exercise, index: number, field: 'sets' | 'weight', value: string) => setOverrides((current) => ({ ...current, [currentKey(index)]: { ...settingsFor(exercise, selectedWeek, selectedDay, index), [field]: field === 'sets' ? Math.max(1, Number(value) || 1) : value } }))
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
    context.fillText(day.focus, 40, 100)
    context.fillStyle = '#777870'
    context.font = '700 13px Trebuchet MS, Malgun Gothic, sans-serif'
    context.fillText('EXERCISE', 40, 145); context.fillText('WEIGHT', 470, 145); context.fillText('REPS', 600, 145); context.fillText('VOLUME', 900, 145)
    day.exercises.forEach((exercise, index) => { const y = 180 + index * 70; const settings = settingsFor(exercise, selectedWeek, selectedDay, index); const record = recordsFor(selectedWeek, selectedDay, index); context.strokeStyle = '#dedfd9'; context.beginPath(); context.moveTo(40, y - 25); context.lineTo(1160, y - 25); context.stroke(); context.fillStyle = '#20211e'; context.font = '16px Trebuchet MS, Malgun Gothic, sans-serif'; context.fillText(displayName(exercise, index), 40, y + 5); context.fillStyle = '#777870'; context.fillText(settings.weight ? `${settings.weight} kg` : '-', 470, y + 5); context.fillText(record.join(' / '), 600, y + 5); context.fillStyle = '#e85f48'; context.fillText(`${volumeFor(exercise, selectedWeek, selectedDay, index).toLocaleString()} kg`, 900, y + 5) })
    const link = document.createElement('a')
    link.download = `LJH-${selectedWeek}-${day.title}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }
  const finishWorkout = () => { const date = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' }); const entries = day.exercises.map((exercise, index) => ({ id: `${Date.now()}-${index}`, name: displayName(exercise, index), date, week: selectedWeek, day: day.title, sets: settingsFor(exercise, selectedWeek, selectedDay, index).sets, weight: settingsFor(exercise, selectedWeek, selectedDay, index).weight, reps: recordsFor(selectedWeek, selectedDay, index) })); setHistory((current) => [...entries, ...current]); day.exercises.forEach((_, index) => { if (!completed[currentKey(index)]) toggleComplete(index) }) }

  return <main className="app-shell">
    <header className="topbar"><div className="brand-mark">LJH <span>TRAINING LOG</span></div><div className="topbar-actions"><div className="topbar-meta"><span className="status-dot" /> 점심 운동 기록</div><button className="save-image-button" onClick={saveWorkoutImage}>기록 저장 ↓</button></div></header>
    <section className="intro"><div><p className="eyebrow">2026 PROGRAM / REV.A</p><h1>오늘의 운동을<br /><em>정확하게 기록하세요.</em></h1><p className="intro-copy">엑셀 루틴을 바탕으로 만든 8주 운동 로그입니다.<br />세트마다 반복 수를 남기고, 다음 운동의 기준을 만들어보세요.</p></div><div className="week-selector"><button className={showTotalSummary ? 'total-active' : ''} onClick={() => setShowTotalSummary(true)}>TOTAL SUMMARY</button>{weeks.map((week) => <button className={!showTotalSummary && selectedWeek === week ? 'active' : ''} key={week} onClick={() => { setSelectedWeek(week); setShowTotalSummary(false) }}>{week}</button>)}</div></section>
    {showTotalSummary ? <section className="total-summary"><div className="section-heading"><div><p className="eyebrow">VOLUME SHEET</p><h2>TOTAL VOLUME SUMMARY</h2></div><span className="progress-label">W1 - W8</span></div><div className="summary-table-wrap"><table className="summary-table"><thead><tr><th>WEEK</th>{muscleGroups.map((muscle) => <th key={muscle}>{muscle}</th>)}<th>TOTAL</th></tr></thead><tbody>{totalSummary.map((values, index) => <tr key={weeks[index]}><th>{weeks[index]}</th>{values.map((value, valueIndex) => <td key={muscleGroups[valueIndex]}>{value.toLocaleString()}</td>)}<td className="row-total">{values.reduce((sum, value) => sum + value, 0).toLocaleString()}</td></tr>)}<tr className="grand-total"><th>TOTAL</th>{summaryTotals.map((value, index) => <td key={muscleGroups[index]}>{value.toLocaleString()}</td>)}<td>{summaryTotals.reduce((sum, value) => sum + value, 0).toLocaleString()}</td></tr></tbody></table></div><p className="summary-note">각 주차 운동 기록의 중량 × 5세트 반복 합계를 부위별로 집계합니다.</p></section> : <><nav className="day-tabs">{workoutDays.map((workout, index) => <button className={selectedDay === index ? 'active' : ''} key={workout.title} onClick={() => setSelectedDay(index)}><span>{workout.title}</span><strong>{workout.focus}</strong></button>)}</nav><section className="workout-layout"><div className="workout-main"><div className="section-heading"><div><p className="eyebrow">{selectedWeek} / {day.title}</p><h2>{day.focus}</h2></div><span className="progress-label">{completedCount} / {day.exercises.length} 완료</span></div><div className="exercise-list">{day.exercises.map((exercise, index) => { const key = currentKey(index); const name = displayName(exercise, index); const settings = settingsFor(exercise, selectedWeek, selectedDay, index); const record = recordsFor(selectedWeek, selectedDay, index); const volume = volumeFor(exercise, selectedWeek, selectedDay, index); return <article className={`exercise-row ${completed[key] ? 'is-complete' : ''}`} key={key}><button className="check-button" onClick={() => toggleComplete(index)}>{completed[key] ? '✓' : String(index + 1).padStart(2, '0')}</button><div className="exercise-info"><div className="exercise-title-line"><input className="exercise-name-input" value={name} onChange={(event) => setNames((current) => ({ ...current, [key]: event.target.value }))} /><button className="history-button" onClick={() => setHistoryExercise(name)}>History</button></div><span>{exercise.muscle}{exercise.note ? ` · ${exercise.note}` : ''}</span></div><label className="target editable-field"><small>목표 세트</small><input type="number" min="1" value={settings.sets} onChange={(event) => updateSetting(exercise, index, 'sets', event.target.value)} /></label><label className="target weight editable-field"><small>기준 중량</small><input inputMode="decimal" value={settings.weight} placeholder="-" onChange={(event) => updateSetting(exercise, index, 'weight', event.target.value)} /><b>kg</b></label><div className="reps-input"><small>Reps Record</small><div className="rep-grid">{record.map((value, setIndex) => <input key={setIndex} placeholder={`S${setIndex + 1}`} value={value} onChange={(event) => updateRep(index, setIndex, event.target.value)} />)}</div></div><div className="volume-cell"><small>볼륨</small><strong>{volume.toLocaleString()}<b> kg</b></strong></div><label className="memo-field"><small>Memo</small><input placeholder="특이 사항" value={memos[key] ?? ''} onChange={(event) => setMemos((current) => ({ ...current, [key]: event.target.value }))} /></label></article> })}</div></div><aside className="summary-panel"><button className="finish-button" onClick={finishWorkout}>운동 완료 처리 <span>→</span></button></aside></section></>}
    <footer><span>LJH TRAINING LOG · v1.0.0</span><span>입력 내용은 이 브라우저에 자동 저장됩니다.</span></footer>
    {historyExercise && <div className="history-backdrop" onClick={() => setHistoryExercise(null)}><section className="history-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}><button className="history-close" onClick={() => setHistoryExercise(null)}>×</button><div className="history-modal-head"><p className="eyebrow">EXERCISE HISTORY</p><h2>{historyExercise}</h2><div className="history-tabs"><strong>History</strong></div></div>{selectedHistory.length === 0 ? <p className="history-empty">아직 저장된 이전 기록이 없습니다.<br />운동 완료 처리 후 기록이 여기에 표시됩니다.</p> : <div className="history-list">{selectedHistory.map((entry) => <article className="history-card" key={entry.id}><div className="history-card-top"><strong>{entry.week} {entry.day}</strong><span>{entry.date}</span></div><div className="history-labels"><span>Sets</span><span>Completed</span><span>Target</span></div>{entry.reps.map((rep, index) => <div className="history-set" key={index}><span>{index + 1}</span><strong>{entry.weight ? `${entry.weight} kg × ${rep || '-'}` : rep || '-'}</strong><span>{entry.weight ? `${entry.weight} kg` : '-'}</span></div>)}</article>)}</div>}</section></div>}
  </main>
}

export default App
