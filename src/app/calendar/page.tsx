'use client';

import * as React from 'react';
import { addDays, format } from 'date-fns';
import { Calendar as CalendarIcon, PlusCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

// Mock data - in a real app, this would come from an API
const allAppointments = {
  [format(new Date(), 'yyyy-MM-dd')]: [
    { time: '10:00 AM', title: 'Team Meeting', type: 'work' },
    { time: '01:00 PM', title: 'Client Call - Acme Corp', type: 'client' },
  ],
  [format(addDays(new Date(), 2), 'yyyy-MM-dd')]: [
    { time: '09:00 AM', title: 'Dentist Appointment', type: 'personal' },
    { time: '03:30 PM', title: 'Project Deadline', type: 'work' },
  ],
  [format(addDays(new Date(), 5), 'yyyy-MM-dd')]: [
    { time: '11:00 AM', title: 'Supplier Negotiation', type: 'work' },
  ],
};

type Appointment = {
  time: string;
  title: string;
  type: 'work' | 'client' | 'personal';
};

export default function CalendarPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);

  React.useEffect(() => {
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      setAppointments(allAppointments[formattedDate] || []);
    }
  }, [date]);

  const badgeColors: Record<Appointment['type'], string> = {
    work: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700',
    client: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700',
    personal: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700',
  };

  return (
    <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Calendar</h1>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Appointment
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-2 md:p-6">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md"
              classNames={{
                day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90",
                day_today: "bg-accent text-accent-foreground",
              }}
              modifiers={{
                hasAppointment: Object.keys(allAppointments).map(d => new Date(d))
              }}
              modifiersStyles={{
                hasAppointment: {
                  position: 'relative',
                  overflow: 'visible',
                },
              }}
              components={{
                DayContent: (props) => {
                    const hasAppointment = Object.keys(allAppointments).includes(format(props.date, 'yyyy-MM-dd'));
                    return (
                        <div className="relative h-full w-full flex items-center justify-center">
                            {props.date.getDate()}
                            {hasAppointment && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-accent" />}
                        </div>
                    );
                },
            }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Appointments for {date ? format(date, 'PPP') : 'today'}
            </CardTitle>
            <CardDescription>
                {appointments.length} event{appointments.length !== 1 && 's'} scheduled.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
                {appointments.length > 0 ? (
                    <div className="space-y-4">
                        {appointments.map((app, index) => (
                            <div key={index} className="flex items-start space-x-4 rounded-lg border p-3">
                                <div className="text-sm font-semibold text-primary">{app.time}</div>
                                <div className="flex-1">
                                    <p className="font-medium">{app.title}</p>
                                    <Badge variant="outline" className={`capitalize mt-1 ${badgeColors[app.type]}`}>{app.type}</Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <CalendarIcon className="h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-muted-foreground">No appointments for this day.</p>
                    </div>
                )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
