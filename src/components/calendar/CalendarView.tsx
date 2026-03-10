import { startOfMonth, endOfMonth, eachDayOfInterval, format, startOfWeek, endOfWeek } from 'date-fns'
import { fr } from 'date-fns/locale'
import { DroppableDay } from './DroppableDay'

import { isSameDay } from 'date-fns'

export function CalendarView({
    posts = [],
    onDayClick,
    onPostClick
}: {
    posts?: any[],
    onDayClick?: (date: Date) => void,
    onPostClick?: (post: any) => void
}) {
    const currentDate = new Date()

    // Calculate padding days to ensure calendar starts on Monday
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const startVisibleDate = startOfWeek(monthStart, { weekStartsOn: 1 })
    const endVisibleDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const days = eachDayOfInterval({
        start: startVisibleDate,
        end: endVisibleDate
    })

    return (
        <div className="flex flex-col h-full bg-background rounded-xl border overflow-hidden">
            <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
                <h2 className="text-xl font-bold capitalize">
                    {format(currentDate, 'MMMM yyyy', { locale: fr })}
                </h2>
            </div>

            <div className="grid grid-cols-7 border-b bg-muted/10">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                    <div key={day} className="p-2 text-center text-[10px] sm:text-sm font-semibold text-muted-foreground border-r last:border-r-0">
                        <span className="hidden sm:inline">{day}</span>
                        <span className="sm:hidden">{day.charAt(0)}</span>
                    </div>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-7 auto-rows-[minmax(80px,1fr)] sm:auto-rows-[minmax(150px,1fr)] min-h-full">
                    {days.map((day, idx) => {
                        const dayPosts = posts.filter(post => post.scheduled_at && isSameDay(new Date(post.scheduled_at), day))
                        return (
                            <div
                                key={day.toISOString()}
                                className={`border-b border-r cursor-pointer hover:bg-muted/10 transition-colors ${idx % 7 === 6 ? 'border-r-0' : ''}`}
                                onClick={() => onDayClick && onDayClick(day)}
                            >
                                <DroppableDay date={day} posts={dayPosts} onPostClick={onPostClick} />
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
