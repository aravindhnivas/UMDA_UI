<script lang="ts">
    import Loadingbtn from '$lib/components/Loadingbtn.svelte';
    import { sleep } from '$lib/utils/initialise';

    export let columns: string[] = [];

    let df_column = '';
    const embeddings = ['mol2vec', 'VICGAE'];
    let embedding = embeddings[0];
</script>

<h2>Embeddings</h2>

<div class="flex gap-1">
    <select class="select select-sm select-bordered" bind:value={df_column}>
        <option disabled selected>Column</option>
        {#each columns as column}
            <option>{column}</option>
        {/each}
    </select>

    <select class="select select-sm select-bordered" bind:value={embedding}>
        <option disabled selected>embedding</option>
        {#each embeddings as embed}
            <option>{embed}</option>
        {/each}
    </select>

    <Loadingbtn
        name="Compute"
        callback={async () => {
            await sleep(10000);
            return true;
        }}
    />
</div>

Lorem ipsum dolor sit, amet consectetur adipisicing elit. Eum ducimus temporibus maxime expedita, dolor iusto nulla id
libero illum autem similique, quam hic eaque sint ex adipisci debitis quas deleniti earum ab laudantium rerum. Ratione,
eaque natus minus tempora porro non excepturi cum magnam quia est molestias in illum facere iure dicta fuga consectetur
reprehenderit velit deserunt quisquam repellat modi minima. Facere reiciendis libero ea est maiores, ducimus dicta! Iste
ad aperiam praesentium, inventore a libero neque cum reiciendis ipsa magni non optio! A quia recusandae obcaecati
laboriosam vero error harum rerum, explicabo praesentium maxime suscipit rem, repudiandae accusantium amet? Lorem ipsum
dolor sit, amet consectetur adipisicing elit. Eum ducimus temporibus maxime expedita, dolor iusto nulla id libero illum
autem similique, quam hic eaque sint ex adipisci debitis quas deleniti earum ab laudantium rerum. Ratione, eaque natus
minus tempora porro non excepturi cum magnam quia est molestias in illum facere iure dicta fuga consectetur
reprehenderit velit deserunt quisquam repellat modi minima. Facere reiciendis libero ea est maiores, ducimus dicta! Iste
ad aperiam praesentium, inventore a libero neque cum reiciendis ipsa magni non optio! A quia recusandae obcaecati
laboriosam vero error harum rerum, explicabo praesentium maxime suscipit rem, repudiandae accusantium amet? Lorem ipsum
dolor sit, amet consectetur adipisicing elit. Eum ducimus temporibus maxime expedita, dolor iusto nulla id libero illum
autem similique, quam hic eaque sint ex adipisci debitis quas deleniti earum ab laudantium rerum. Ratione, eaque natus
minus tempora porro non excepturi cum magnam quia est molestias in illum facere iure dicta fuga consectetur
reprehenderit velit deserunt quisquam repellat modi minima. Facere reiciendis libero ea est maiores, ducimus dicta! Iste
ad aperiam praesentium, inventore a libero neque cum reiciendis ipsa magni non optio! A quia recusandae obcaecati
laboriosam vero error harum rerum, explicabo praesentium maxime suscipit rem, repudiandae accusantium amet? Lorem ipsum
dolor sit, amet consectetur adipisicing elit. Eum ducimus temporibus maxime expedita, dolor iusto nulla id libero illum
autem similique, quam hic eaque sint ex adipisci debitis quas deleniti earum ab laudantium rerum. Ratione, eaque natus
minus tempora porro non excepturi cum magnam quia est molestias in illum facere iure dicta fuga consectetur
reprehenderit velit deserunt quisquam repellat modi minima. Facere reiciendis libero ea est maiores, ducimus dicta! Iste
ad aperiam praesentium, inventore a libero neque cum reiciendis ipsa magni non optio! A quia recusandae obcaecati
laboriosam vero error harum rerum, explicabo praesentium maxime suscipit rem, repudiandae accusantium amet? Lorem ipsum
dolor sit, amet consectetur adipisicing elit. Eum ducimus temporibus maxime expedita, dolor iusto nulla id libero illum
autem similique, quam hic eaque sint ex adipisci debitis quas deleniti earum ab laudantium rerum. Ratione, eaque natus
minus tempora porro non excepturi cum magnam quia est molestias in illum facere iure dicta fuga consectetur
reprehenderit velit deserunt quisquam repellat modi minima. Facere reiciendis libero ea est maiores, ducimus dicta! Iste
ad aperiam praesentium, inventore a libero neque cum reiciendis ipsa magni non optio! A quia recusandae obcaecati
laboriosam vero error harum rerum, explicabo praesentium maxime suscipit rem, repudiandae accusantium amet? Lorem ipsum
dolor sit, amet consectetur adipisicing elit. Eum ducimus temporibus maxime expedita, dolor iusto nulla id libero illum
autem similique, quam hic eaque sint ex adipisci debitis quas deleniti earum ab laudantium rerum. Ratione, eaque natus
minus tempora porro non excepturi cum magnam quia est molestias in illum facere iure dicta fuga consectetur
reprehenderit velit deserunt quisquam repellat modi minima. Facere reiciendis libero ea est maiores, ducimus dicta! Iste
ad aperiam praesentium, inventore a libero neque cum reiciendis ipsa magni non optio! A quia recusandae obcaecati
laboriosam vero error harum rerum, explicabo praesentium maxime suscipit rem, repudiandae accusantium amet?
