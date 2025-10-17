export const tutorialSteps = [
  {
    target: "#tutorial-step-1",
    content:
      "Welcome! Here you can customize your company logo. Click to upload an image.",
    placement: "left" as const,
    disableBeacon: true,
  },
  {
    target: "#tutorial-step-2",
    content: "Here you can configure all your organization information.",
    placement: "top" as const,
  },
  {
    target: "#tutorial-step-3",
    content: "Great! Now let's set up your products. Click here to go to the products page.",
    placement: "right" as const,
  },
  {
    target: "#tutorial-step-4",
    content: "Cool! Now let's select your products.",
    placement: "right" as const,
  },
  {
    target: ".product-card",
    content: "Perfect! Here you can add new products to your catalog. Let's open view!",
    placement: "top" as const,
  },
  {
    target: "#view-product",
    content: "hey",
    placement: "right" as const,
  },
];

export const enableProductSteps = [
  {
    target: "#enable-product-for-clinic",
    content: "Perfect! Now let's enable the product for your clinic.",
    placement: "right" as const,
    disableBeacon: true,
  },
];