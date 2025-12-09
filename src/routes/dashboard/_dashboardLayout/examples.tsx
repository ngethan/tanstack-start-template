import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import {
	type ColumnDef,
	type SortingState,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	XAxis,
	YAxis,
} from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/_dashboardLayout/examples")({
	component: ExamplesPage,
});

// Sample data for the table
type User = {
	id: string;
	name: string;
	email: string;
	role: string;
	status: "active" | "inactive";
	createdAt: Date;
};

const sampleUsers: User[] = [
	{
		id: "1",
		name: "Alice Johnson",
		email: "alice@example.com",
		role: "Admin",
		status: "active",
		createdAt: new Date("2024-01-15"),
	},
	{
		id: "2",
		name: "Bob Smith",
		email: "bob@example.com",
		role: "Member",
		status: "active",
		createdAt: new Date("2024-02-20"),
	},
	{
		id: "3",
		name: "Carol Williams",
		email: "carol@example.com",
		role: "Member",
		status: "inactive",
		createdAt: new Date("2024-03-10"),
	},
	{
		id: "4",
		name: "David Brown",
		email: "david@example.com",
		role: "Owner",
		status: "active",
		createdAt: new Date("2024-01-05"),
	},
	{
		id: "5",
		name: "Eva Martinez",
		email: "eva@example.com",
		role: "Member",
		status: "active",
		createdAt: new Date("2024-04-01"),
	},
];

const columns: ColumnDef<User>[] = [
	{
		id: "select",
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && "indeterminate")
				}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Select all"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label="Select row"
			/>
		),
		enableSorting: false,
	},
	{
		accessorKey: "name",
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				className="-ml-4"
			>
				Name
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
	},
	{
		accessorKey: "email",
		header: "Email",
	},
	{
		accessorKey: "role",
		header: "Role",
		cell: ({ row }) => (
			<span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-primary/10 text-primary">
				{row.getValue("role")}
			</span>
		),
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => {
			const status = row.getValue("status") as string;
			return (
				<span
					className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
						status === "active"
							? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
							: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
					}`}
				>
					{status}
				</span>
			);
		},
	},
	{
		accessorKey: "createdAt",
		header: "Created",
		cell: ({ row }) => {
			const date = row.getValue("createdAt") as Date;
			return date.toLocaleDateString();
		},
	},
];

function DataTableExample() {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [rowSelection, setRowSelection] = useState({});

	const table = useReactTable({
		data: sampleUsers,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: setSorting,
		onRowSelectionChange: setRowSelection,
		state: {
			sorting,
			rowSelection,
		},
		initialState: {
			pagination: {
				pageSize: 5,
			},
		},
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle>Data Table</CardTitle>
				<CardDescription>
					A data table built with TanStack Table featuring sorting, selection,
					and pagination.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<TableHead key={header.id}>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
										</TableHead>
									))}
								</TableRow>
							))}
						</TableHeader>
						<TableBody>
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<TableRow
										key={row.id}
										data-state={row.getIsSelected() && "selected"}
									>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id}>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</TableCell>
										))}
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell
										colSpan={columns.length}
										className="h-24 text-center"
									>
										No results.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
				<div className="flex items-center justify-between py-4">
					<div className="text-sm text-muted-foreground">
						{table.getFilteredSelectedRowModel().rows.length} of{" "}
						{table.getFilteredRowModel().rows.length} row(s) selected.
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<span className="text-sm text-muted-foreground">
							Page {table.getState().pagination.pageIndex + 1} of{" "}
							{table.getPageCount()}
						</span>
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function TanStackFormExample() {
	const form = useForm({
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
			role: "",
			notifications: false,
		},
		onSubmit: async ({ value }) => {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));
			toast.success("Form submitted successfully!", {
				description: `Welcome, ${value.firstName} ${value.lastName}!`,
			});
			console.log("Form values:", value);
		},
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle>TanStack Form</CardTitle>
				<CardDescription>
					A type-safe form built with TanStack Form featuring validation and
					field-level state.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="space-y-6"
				>
					<div className="grid gap-4 sm:grid-cols-2">
						<form.Field
							name="firstName"
							validators={{
								onChange: ({ value }) =>
									value.length < 2
										? "First name must be at least 2 characters"
										: undefined,
							}}
						>
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>First Name</Label>
									<Input
										id={field.name}
										placeholder="John"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
									{field.state.meta.errors.length > 0 && (
										<p className="text-sm text-destructive">
											{field.state.meta.errors.join(", ")}
										</p>
									)}
								</div>
							)}
						</form.Field>

						<form.Field
							name="lastName"
							validators={{
								onChange: ({ value }) =>
									value.length < 2
										? "Last name must be at least 2 characters"
										: undefined,
							}}
						>
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Last Name</Label>
									<Input
										id={field.name}
										placeholder="Doe"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
									{field.state.meta.errors.length > 0 && (
										<p className="text-sm text-destructive">
											{field.state.meta.errors.join(", ")}
										</p>
									)}
								</div>
							)}
						</form.Field>
					</div>

					<form.Field
						name="email"
						validators={{
							onChange: ({ value }) => {
								if (!value) return "Email is required";
								if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
									return "Please enter a valid email";
								}
								return undefined;
							},
						}}
					>
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Email</Label>
								<Input
									id={field.name}
									type="email"
									placeholder="john@example.com"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
								{field.state.meta.errors.length > 0 && (
									<p className="text-sm text-destructive">
										{field.state.meta.errors.join(", ")}
									</p>
								)}
							</div>
						)}
					</form.Field>

					<form.Field name="role">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Role</Label>
								<div className="relative">
									<Select
										value={field.state.value}
										onValueChange={(value) => field.handleChange(value)}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select a role" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="member">Member</SelectItem>
											<SelectItem value="admin">Admin</SelectItem>
											<SelectItem value="owner">Owner</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						)}
					</form.Field>

					<form.Field name="notifications">
						{(field) => (
							<div className="relative flex items-center space-x-2">
								<Checkbox
									id={field.name}
									checked={field.state.value}
									onCheckedChange={(checked) =>
										field.handleChange(checked === true)
									}
								/>
								<Label htmlFor={field.name} className="font-normal">
									Receive email notifications
								</Label>
							</div>
						)}
					</form.Field>

					<form.Subscribe
						selector={(state) => [state.canSubmit, state.isSubmitting]}
					>
						{([canSubmit, isSubmitting]) => (
							<Button type="submit" disabled={!canSubmit || isSubmitting}>
								{isSubmitting ? "Submitting..." : "Submit"}
							</Button>
						)}
					</form.Subscribe>
				</form>
			</CardContent>
		</Card>
	);
}

// Chart data
const chartData = [
	{ month: "Jan", revenue: 4000, users: 240 },
	{ month: "Feb", revenue: 3000, users: 139 },
	{ month: "Mar", revenue: 5000, users: 980 },
	{ month: "Apr", revenue: 4500, users: 390 },
	{ month: "May", revenue: 6000, users: 480 },
	{ month: "Jun", revenue: 5500, users: 380 },
];

const chartConfig = {
	revenue: {
		label: "Revenue",
		color: "var(--chart-1)",
	},
	users: {
		label: "Users",
		color: "var(--chart-3)",
	},
} satisfies ChartConfig;

function ChartExample() {
	return (
		<div className="grid gap-8 lg:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle>Area Chart</CardTitle>
					<CardDescription>
						Monthly revenue over the past 6 months.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ChartContainer config={chartConfig} className="h-[300px] w-full">
						<AreaChart data={chartData}>
							<CartesianGrid strokeDasharray="3 3" vertical={false} />
							<XAxis
								dataKey="month"
								tickLine={false}
								axisLine={false}
								tickMargin={8}
							/>
							<YAxis tickLine={false} axisLine={false} tickMargin={8} />
							<ChartTooltip content={<ChartTooltipContent />} />
							<Area
								type="monotone"
								dataKey="revenue"
								stroke="var(--color-revenue)"
								fill="var(--color-revenue)"
								fillOpacity={0.2}
								strokeWidth={2}
							/>
						</AreaChart>
					</ChartContainer>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Bar Chart</CardTitle>
					<CardDescription>User signups compared to revenue.</CardDescription>
				</CardHeader>
				<CardContent>
					<ChartContainer config={chartConfig} className="h-[300px] w-full">
						<BarChart data={chartData}>
							<CartesianGrid strokeDasharray="3 3" vertical={false} />
							<XAxis
								dataKey="month"
								tickLine={false}
								axisLine={false}
								tickMargin={8}
							/>
							<YAxis tickLine={false} axisLine={false} tickMargin={8} />
							<ChartTooltip content={<ChartTooltipContent />} />
							<ChartLegend content={<ChartLegendContent />} />
							<Bar
								dataKey="revenue"
								fill="var(--color-revenue)"
								radius={[4, 4, 0, 0]}
							/>
							<Bar
								dataKey="users"
								fill="var(--color-users)"
								radius={[4, 4, 0, 0]}
							/>
						</BarChart>
					</ChartContainer>
				</CardContent>
			</Card>
		</div>
	);
}

function ExamplesPage() {
	return (
		<div className="p-6 space-y-8">
			<div>
				<h1 className="text-2xl font-bold">Component Examples</h1>
				<p className="text-muted-foreground mt-1">
					Examples of Charts, TanStack Table, and TanStack Form components.
				</p>
			</div>

			<div className="grid gap-8">
				<ChartExample />
				<DataTableExample />
				<TanStackFormExample />
			</div>
		</div>
	);
}
