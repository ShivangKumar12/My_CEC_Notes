
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { FileText, Users, Download, Star } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import type { ChartConfig } from '@/components/ui/chart';
import { db } from '@/lib/firebase';
import { collection, getDocs, getCountFromServer, query, orderBy, limit } from 'firebase/firestore';
import type { Note } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const chartConfig = {
  notes: {
    label: "Notes",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const CustomizedAxisTick = (props: any) => {
    const { x, y, payload } = props;
    return (
        <g transform={`translate(${x},${y})`}>
            <text x={0} y={0} dy={16} textAnchor="end" fill="#666" transform="rotate(-35)">
                {payload.value}
            </text>
        </g>
    );
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalNotes: 0,
    totalUsers: 0,
    totalDownloads: 0,
    averageRating: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch counts
        const notesCountSnapshot = await getCountFromServer(collection(db, 'notes'));
        const usersCountSnapshot = await getCountFromServer(collection(db, 'users'));
        const totalNotes = notesCountSnapshot.data().count;
        const totalUsers = usersCountSnapshot.data().count;

        // Fetch all notes for aggregated stats
        const notesSnapshot = await getDocs(collection(db, 'notes'));
        const allNotes = notesSnapshot.docs.map(doc => doc.data() as Note);

        const totalDownloads = allNotes.reduce((sum, note) => sum + note.downloads, 0);
        const averageRating = allNotes.length > 0
          ? allNotes.reduce((sum, note) => sum + note.averageRating, 0) / allNotes.length
          : 0;

        setStats({ totalNotes, totalUsers, totalDownloads, averageRating });
        
        // Prepare chart data
        const notesBySubject = allNotes.reduce((acc, note) => {
            acc[note.subject] = (acc[note.subject] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        setChartData(Object.entries(notesBySubject).map(([subject, count]) => ({ subject, notes: count })));

        // Fetch recent notes
        const recentNotesQuery = query(collection(db, 'notes'), orderBy('createdAt', 'desc'), limit(5));
        const recentNotesSnapshot = await getDocs(recentNotesQuery);
        const recentNotesData = recentNotesSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt.toDate(),
            } as Note;
        });
        setRecentNotes(recentNotesData);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
        <div className="flex flex-col gap-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Skeleton className="lg:col-span-4 h-96" />
                <Skeleton className="lg:col-span-3 h-96" />
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalNotes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDownloads.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Notes per Subject</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="subject" tickLine={false} tickMargin={10} axisLine={false} interval={0} tick={<CustomizedAxisTick />} />
                  <YAxis />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                  <Bar dataKey="notes" fill="var(--color-notes)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentNotes.map((note) => (
                  <TableRow key={note.id}>
                    <TableCell className="font-medium truncate max-w-40">{note.title}</TableCell>
                    <TableCell><Badge variant="outline">{note.subject}</Badge></TableCell>
                    <TableCell className="text-right">{format(note.createdAt, 'PP')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
