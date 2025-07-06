<script setup lang="ts">
    import type {
        ColumnDef,
        ColumnFiltersState,
        SortingState,
        VisibilityState
    } from '@tanstack/vue-table'
    import { valueUpdater } from '@/components/ui/table/utils'
    import { Button } from '@/components/ui/button'
    import {
        DropdownMenu,
        DropdownMenuCheckboxItem,
        DropdownMenuContent,
        DropdownMenuTrigger
    } from '@/components/ui/dropdown-menu'
    import {
        Table,
        TableBody,
        TableCell,
        TableHead,
        TableHeader,
        TableRow
    } from '@/components/ui/table'
    import {
        FlexRender,
        getCoreRowModel,
        getFilteredRowModel,
        getPaginationRowModel,
        getSortedRowModel,
        useVueTable
    } from '@tanstack/vue-table'
    import { ChevronDown } from 'lucide-vue-next'
    import { computed, ref, type Ref, watch } from 'vue'
    import Input from '../input/Input.vue'

    interface DataTableProps<TData, TValue> {
        columns: ColumnDef<TData, TValue>[]
        data: TData[]
        globalFilter?: string
    }

    const props = defineProps<DataTableProps<any, any>>()

    const sorting = ref<SortingState>([])
    const columnFilters = ref<ColumnFiltersState>([])
    const columnVisibility = ref<VisibilityState>({})
    const rowSelection = ref({})
    const globalFilterValue = computed(() => props.globalFilter || '')

    const table = useVueTable({
        get data() {
            return props.data
        },
        columns: props.columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: (updaterOrValue) => valueUpdater(updaterOrValue, sorting),
        onColumnFiltersChange: (updaterOrValue) => valueUpdater(updaterOrValue, columnFilters),
        onColumnVisibilityChange: (updaterOrValue) =>
            valueUpdater(updaterOrValue, columnVisibility),
        onRowSelectionChange: (updaterOrValue) => valueUpdater(updaterOrValue, rowSelection),
        state: {
            get sorting() {
                return sorting.value
            },
            get columnFilters() {
                return columnFilters.value
            },
            get columnVisibility() {
                return columnVisibility.value
            },
            get rowSelection() {
                return rowSelection.value
            },
            get globalFilter() {
                return globalFilterValue.value
            }
        },
        initialState: {
            // columnOrder: ['age', 'speciality', 'lastName'], //customize the initial column order
        },
        onGlobalFilterChange: (updaterOrValue) => {
            globalFilterValue.value = typeof updaterOrValue === 'function'
                ? updaterOrValue(globalFilterValue.value)
                : updaterOrValue
        }
    })
    // table.setPageSize(50000)

    watch(props.data, () => {
        // table.setPageSize(50000)
        console.log(props.data, 'changed')
    })

    // setInterval(() => {
    //   console.log(props.data,'props.data')
    //   console.log(xx.value,'xx.value')

    //   xx.value.push(props.data[0])
    //   xx.value = [...xx.value]
    // }, 1000)

    onMounted(() => {
        console.log('DataTable mounted')
    })
</script>

<template>
    <div class="w-full">
        <!-- {{ sorting }} -->
        <!-- {{ props.data }} -->
        <div class="flex items-center py-4">
            <DropdownMenu>
                <DropdownMenuTrigger as-child>
                    <Button variant="outline" class="ml-auto">
                        Columns
                        <ChevronDown class="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuCheckboxItem
                        v-for="column in table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())"
                        :key="column.id"
                        class="capitalize"
                        :model-value="column.getIsVisible()"
                        @update:model-value="(value) => column.toggleVisibility(!!value)"
                    >
                        {{ column.id }}
                    </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <div class="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
                        <TableHead v-for="header in headerGroup.headers" :key="header.id">
                            <FlexRender
                                v-if="!header.isPlaceholder"
                                :render="header.column.columnDef.header"
                                :props="header.getContext()"
                            />
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <template v-if="table.getRowModel().rows?.length">
                        <TableRow
                            v-for="row in table.getRowModel().rows"
                            :key="row.id"
                            :data-state="row.getIsSelected() && 'selected'"
                        >
                            <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                                <FlexRender
                                    :render="cell.column.columnDef.cell"
                                    :props="cell.getContext()"
                                />
                            </TableCell>
                        </TableRow>
                    </template>
                    <TableRow v-else>
                        <TableCell :colspan="columns.length" class="h-24 text-center">
                            No results.
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
        <div class="flex items-center justify-end space-x-2 py-4">
            <div class="flex-1 text-sm text-muted-foreground">
                {{ table.getFilteredSelectedRowModel().rows.length }} of
                {{ table.getFilteredRowModel().rows.length }} row(s) selected.
            </div>
            <div class="space-x-2 flex items-center">
                <Button
                    variant="outline"
                    size="sm"
                    :disabled="!table.getCanPreviousPage()"
                    @click="table.previousPage()"
                >
                    Previous
                </Button>
                <div class="flex items-center gap-1">
                    <span class="text-sm text-muted-foreground"
                        >Page {{ table.getState().pagination.pageIndex + 1 }} of
                        {{ table.getPageCount() }}</span
                    >
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    :disabled="!table.getCanNextPage()"
                    @click="table.nextPage()"
                >
                    Next
                </Button>
            </div>
        </div>
    </div>
</template>
