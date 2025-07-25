"use client";

// eslint-disable-next-line no-restricted-imports
import { noop } from "lodash";
import { useRouter } from "next/navigation";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";
import { z } from "zod";

import { useCompatSearchParams } from "@calcom/lib/hooks/useCompatSearchParams";
import classNames from "@calcom/ui/classNames";

import { Button } from "../../button";
import { Steps } from "../../form/step";

type DefaultStep = {
  title: string;
  containerClassname?: string;
  contentClassname?: string;
  description: string;
  content?: ((setIsPending: Dispatch<SetStateAction<boolean>>) => JSX.Element) | JSX.Element;
  isEnabled?: boolean;
  isPending?: boolean;
};

function WizardForm<T extends DefaultStep>(props: {
  href: string;
  steps: T[];
  disableNavigation?: boolean;
  containerClassname?: string;
  prevLabel?: string;
  nextLabel?: string;
  finishLabel?: string;
  stepLabel?: React.ComponentProps<typeof Steps>["stepLabel"];
}) {
  const searchParams = useCompatSearchParams();
  const { href, steps, nextLabel = "Next", finishLabel = "Finish", prevLabel = "Back", stepLabel } = props;
  const router = useRouter();
  const stepSchema = z.coerce.number().int().min(1).max(steps.length).default(1);
  const stepResult = stepSchema.safeParse(searchParams?.get("step"));
  const step = stepResult.success ? stepResult.data : 1;
  const currentStep = steps[step - 1];
  const setStep = (newStep: number) => {
    router.replace(`${href}?step=${newStep || 1}`);
  };
  const [currentStepisPending, setCurrentStepisPending] = useState(false);

  useEffect(() => {
    setCurrentStepisPending(false);
  }, [currentStep]);

  return (
    <div className="mx-auto mt-4 print:w-full" data-testid="wizard-form">
      <div className={classNames("overflow-hidden  md:mb-2 md:w-[700px]", props.containerClassname)}>
        <div className="px-6 py-5 sm:px-14">
          <h1 className="font-cal text-emphasis text-2xl" data-testid="step-title">
            {currentStep.title}
          </h1>
          <p className="text-subtle text-sm" data-testid="step-description">
            {currentStep.description}
          </p>
          {!props.disableNavigation && (
            <Steps
              maxSteps={steps.length}
              currentStep={step}
              nextStep={noop}
              stepLabel={stepLabel}
              data-testid="wizard-step-component"
            />
          )}
        </div>
      </div>
      <div className={classNames("mb-8 overflow-hidden md:w-[700px]", props.containerClassname)}>
        <div className={classNames("print:p-none max-w-3xl px-8 py-5 sm:p-6", currentStep.contentClassname)}>
          {typeof currentStep.content === "function"
            ? currentStep.content(setCurrentStepisPending)
            : currentStep.content}
        </div>
        {!props.disableNavigation && (
          <div className="flex justify-end px-4 py-4 print:hidden sm:px-6">
            {step > 1 && (
              <Button
                color="secondary"
                onClick={() => {
                  setStep(step - 1);
                }}>
                {prevLabel}
              </Button>
            )}

            <Button
              tabIndex={0}
              loading={currentStepisPending}
              type="submit"
              color="primary"
              form={`wizard-step-${step}`}
              disabled={currentStep.isEnabled === false}
              className="relative ml-2">
              {step < steps.length ? nextLabel : finishLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default WizardForm;
