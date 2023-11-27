<script lang="ts">
    export let id: string;
    export let display: string = 'none';
</script>

<div class="h-full overflow-auto" {id} style:display>
    <div class="box__div h-[100rem]">Data</div>
</div>
