<script lang="ts">
    import Tab, { Label } from '@smui/tab';
    import TabBar from '@smui/tab-bar';
    import { model } from './stores';
    import supervised_ml_models from '$lib/config/ml_model/ml_models_parameters';
    import { typeSafeObjectKeys } from '$lib/utils';
</script>

<div class="flex flex-wrap w-max">
    <TabBar tabs={typeSafeObjectKeys(supervised_ml_models)} let:tab bind:active={$model}>
        <Tab {tab}>
            <Label>{tab}</Label>
        </Tab>
    </TabBar>
</div>
