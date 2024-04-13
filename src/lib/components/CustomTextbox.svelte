<script lang="ts">
    import Textfield from '@smui/textfield';
    import HelperText from '@smui/textfield/helper-text';

    export let type: 'text' | 'number' = 'text';
    export let label: string = '';
    export let value: string | number = '';
    export let helper: string = '';
</script>

<div>
    <Textfield bind:value {label} {type}>
        <HelperText persistent slot="helper">{helper}</HelperText>
    </Textfield>
</div>
