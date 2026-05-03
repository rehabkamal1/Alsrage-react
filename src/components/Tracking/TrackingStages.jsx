import React, { useState } from "react";
import {
  Button,
  ProgressBar,
  Collapse,
  ListGroup,
  Card,
} from "react-bootstrap";

const stagesConfig = [
  {
    id: 1,
    name: "استلام الطلب",
    field: "is_received",
    nextAction: "مراجعة المستندات",
  },
  {
    id: 2,
    name: "مراجعة المستندات",
    field: "is_reviewed",
    nextAction: "توثيق العقد",
  },
  {
    id: 3,
    name: "توثيق العقد",
    field: "is_authenticated",
    nextAction: "إرسال التأشيرة",
  },
  {
    id: 4,
    name: "إرسال التأشيرة",
    field: "visa_sent",
    nextAction: "متابعة العميل",
  },
  {
    id: 5,
    name: "متابعة العميل",
    field: "is_completed",
    nextAction: "إتمام الطلب",
  },
];

const TrackingStages = ({ tracking, onUpdateStage }) => {
  const [openStage, setOpenStage] = useState(null);

  const getCurrentStage = () => {
    let currentIndex = -1;
    for (let i = 0; i < stagesConfig.length; i++) {
      if (!tracking[stagesConfig[i].field]) {
        currentIndex = i;
        break;
      }
    }
    if (
      currentIndex === -1 &&
      tracking[stagesConfig[stagesConfig.length - 1].field]
    ) {
      currentIndex = stagesConfig.length;
    }
    return currentIndex;
  };

  const currentStage = getCurrentStage();
  const progress = (currentStage / stagesConfig.length) * 100;

  return (
    <Card className="mb-3 shadow-sm border-0 rounded-4">
      <Card.Body className="p-3">
        <h6 className="mb-3 fw-bold">
          مراحل متابعة الطلب #{tracking.order_number || tracking.order_id}
        </h6>
        <ProgressBar
          now={progress}
          label={`${Math.round(progress)}%`}
          className="mb-3"
          style={{ height: "25px" }}
        />

        {stagesConfig.map((stage, idx) => {
          const isCompleted = tracking[stage.field];
          const isCurrent = !isCompleted && currentStage === idx;

          return (
            <div key={stage.id} className="mb-2">
              <Button
                variant={
                  isCompleted ? "success" : isCurrent ? "primary" : "secondary"
                }
                size="sm"
                className="w-100 text-start rounded-3"
                onClick={() =>
                  isCurrent &&
                  setOpenStage(openStage === stage.id ? null : stage.id)
                }
                disabled={!isCurrent && !isCompleted}
              >
                {isCompleted ? "✓ " : isCurrent ? "▶ " : "○ "}
                {stage.name}
                {isCurrent && !isCompleted && " (قيد التنفيذ)"}
              </Button>

              <Collapse in={openStage === stage.id && isCurrent}>
                <div className="p-3 border rounded-3 mt-2 mb-2 bg-light">
                  <ListGroup variant="flush">
                    <ListGroup.Item className="bg-transparent px-0">
                      <strong>الإجراء التالي:</strong> {stage.nextAction}
                    </ListGroup.Item>
                    <ListGroup.Item className="bg-transparent px-0">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onUpdateStage(stage.field, true)}
                      >
                        إتمام {stage.name}
                      </Button>
                    </ListGroup.Item>
                  </ListGroup>
                </div>
              </Collapse>
            </div>
          );
        })}
      </Card.Body>
    </Card>
  );
};

export default TrackingStages;
