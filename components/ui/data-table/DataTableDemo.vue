<script setup lang="ts">
    import type { ColumnDef } from '@tanstack/vue-table'
    import { Button } from '@/components/ui/button'
    import { Checkbox } from '@/components/ui/checkbox'
    import { ArrowUpDown } from 'lucide-vue-next'
    import { h } from 'vue'
    import DataTable from './DataTable.vue'

    interface Payment {
        id: string
        amount: number
        status: 'pending' | 'processing' | 'success' | 'failed'
        email: string
    }

    const data: Payment[] = [
        {
            id: 'm5gr84i9',
            amount: 316,
            status: 'success',
            email: 'ken99@yahoo.com'
        }
    ]

    function shuffle(array) {
        let currentIndex = array.length

        // While there remain elements to shuffle...
        while (currentIndex != 0) {
            // Pick a remaining element...
            const randomIndex = Math.floor(Math.random() * currentIndex)
            currentIndex--

            // And swap it with the current element.
            ;[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
        }
    }

    shuffle(data)
    const columns: ColumnDef<Payment>[] = [
        {
            id: 'select',
            header: ({ table }) =>
                h(Checkbox, {
                    modelValue:
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && 'indeterminate'),
                    'onUpdate:modelValue': (value) => table.toggleAllPageRowsSelected(!!value),
                    ariaLabel: 'Select all'
                }),
            cell: ({ row }) =>
                h(Checkbox, {
                    modelValue: row.getIsSelected(),
                    'onUpdate:modelValue': (value) => row.toggleSelected(!!value),
                    ariaLabel: 'Select row'
                }),
            enableSorting: false,
            enableHiding: false
            // TODO: hide column
        },
        {
            accessorKey: 'status',
            header: ({ column }) => {
                return h(
                    Button,
                    {
                        variant: 'ghost',
                        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
                    },
                    () => ['Status', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]
                )
            },
            cell: ({ row }) => h('div', { class: 'capitalize' }, row.getValue('status'))
        },
        {
            accessorKey: 'email',
            header: ({ column }) => {
                return h(
                    Button,
                    {
                        variant: 'ghost',
                        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
                    },
                    () => ['Email', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]
                )
            },
            cell: ({ row }) => h('div', { class: 'lowercase' }, row.getValue('email'))
        },
        {
            accessorKey: 'amount',
            header: () => h('div', { class: 'text-right' }, 'Amount'),
            cell: ({ row }) => {
                const amount = Number.parseFloat(row.getValue('amount'))
                const formatted = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                }).format(amount)
                return h('div', { class: 'text-right font-medium' }, formatted)
            }
        }
    ]
</script>

<template>
    <DataTable :columns="columns" :data="data" />
</template>
