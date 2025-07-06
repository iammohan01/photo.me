<script lang="ts">
import {createContext} from "reka-ui";

export interface VisitRootContext {
  visitId: Readonly<Ref<number>>,
  patientVisit: Ref<PatientVisit>,
  transcription: Ref<Transcription>,
  patient: Ref<Patient>
}

interface VisitRootProps {
  visitId: number
}

export const [injectVisitRootContext, provideVisitRootContext] = createContext<VisitRootContext>('VisitRootContext')
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<VisitRootProps>(), {
  visitId: Number(useRoute().params.visitId as string)
})

const patientVisit = ref<PatientVisit>();
const transcription = ref<Transcription>();
const patient = ref<Patient>();
provideVisitRootContext({visitId: props.visitId, patientVisit, transcription, patient})

</script>
<template>
  <slot/>
</template>