<script>
  import * as Card from "$lib/components/ui/card/index.js";
  import { Progress } from "$lib/components/ui/progress/index.js";
  
  export let title;
  export let value;
  export let change;
  export let progressValue;
  export let progressColor = "default"; // New prop for progress color
</script>

<Card.Root>
  <Card.Header class="pb-2">
    <Card.Description>{title}</Card.Description>
    <Card.Title class="text-3xl">{value}</Card.Title>
  </Card.Header>
  <Card.Content>
    <div class="text-muted-foreground text-xs">{change}</div>
  </Card.Content>
  <Card.Footer>
    <Progress 
      value={progressValue} 
      aria-label="{change} increase" 
      class={progressColor === "orange" ? "bg-orange-500" : 
             progressColor === "red" ? "bg-red-500" : ""}
    />
  </Card.Footer>
</Card.Root>