<script lang="ts">
    import Tab, { Label } from '@smui/tab';
    import TabBar from '@smui/tab-bar';
    export let tabs: string[];
    export let active: string;
</script>

<TabBar {tabs} let:tab bind:active>
    <Tab {tab}>
        <Label>{tab}</Label>
    </Tab>
</TabBar>
