import React, { useEffect, useState, useRef, useCallback } from 'react';
import { connect } from 'react-redux';
import { Draggable } from 'react-beautiful-dnd';
// import { Sortable } from '@shopify/draggable';

import {
  createTier,
  editTier,
  fetchTitles,
  deleteTier,
  setOrder,
} from '../../actions';
import Title from '../titles/Title';
import AddButton from '../reusable/AddButton';
import DeleteButton from '../reusable/DeleteButton';
import requireAuth from '../reusable/requireAuth';
import AddTitle from '../titles/AddTitle';

const Tier = ({
  tier,
  titles,
  fetchTitles,
  authorized,
  band,
  tiers,
  editTier,
  deleteTier,
  setOrder,
}) => {
  const [expand, setExpand] = useState(false);
  const [titlesToRender, setTitlesToRender] = useState(null);
  const [orderedTitles, setOrderedTitles] = useState({});

  useEffect(() => {
    fetchTitles(tier.id);
  }, [fetchTitles, setOrder, tier.id]);

  useEffect(() => {
    const trackListTitles = tier.trackList
      .map((id) => titles[id])
      .filter((title) => title);

    setTitlesToRender(trackListTitles);

    trackListTitles.map((t) => {
      if (t?.selectedBounce?.latest && t.selectedVersion?.current) {
        findLatest(t, t.selectedBounce);
      }
      return null;
    });
  }, [titles, tier.trackList]);

  // useEffect(() => {
  //   if (expand) {
  //     const sortable = new Sortable(
  //       document.querySelectorAll('.title-container'),
  //       {
  //         draggable: '.title-margin',
  //         classes: {
  //           'draggable:over': ['empty-title'],
  //           mirror: ['hidden'],
  //           'source:dragging': ['title-enlarged'],
  //         },
  //       }
  //     );
  //     sortable.on('drag:over', (e) => {
  //       console.log(e.over);
  //     });
  //   }
  // }, [expand]);

  const findLatest = (title, bounce) => {
    setOrderedTitles((state) => {
      if (bounce) {
        return {
          ...state,
          [title.id]: new Date(bounce.date),
        };
      } else {
        return {
          ...state,
          [title.id]: null,
        };
      }
    });
  };

  const orderTitles = useCallback(
    (t) => {
      const titleList = [...t];

      if (!tier.orderBy || tier.orderBy === 'date') {
        titleList.sort((a, b) => {
          if (orderedTitles[a.id] && orderedTitles[b.id]) {
            if (orderedTitles[a.id] > orderedTitles[b.id]) {
              return -1;
            } else {
              return 1;
            }
          } else if (orderedTitles[a.id]) {
            return -1;
          } else if (orderedTitles[b.id]) {
            return 1;
          } else if (a.title < b.title) {
            return -1;
          } else {
            return 1;
          }
        });
      }

      if (tier.orderBy === 'name') {
        titleList.sort((a, b) => {
          return a.title < b.title ? -1 : 1;
        });
      }

      return titleList;
    },
    [orderedTitles, tier.orderBy]
  );

  const renderTitles = () => {
    const titleList = orderTitles(titlesToRender);
    // console.log(titleList.map((t) => t.selectedBounce?.date));

    return titleList.map((title) => {
      if (title) {
        return (
          <Title
            title={title}
            tier={tier}
            key={title.id}
            findLatest={findLatest}
          />
        );
      }
      return null;
    });
  };

  const renderAddButton = () => {
    if (authorized) {
      return (
        <div className="order-by">
          <div>Add a Title to this Tier</div>
          <AddTitle tier={tier} onSubmit={() => setExpand(true)} />
        </div>
      );
    }
  };

  const renderEditButton = () => {
    if (authorized) {
      const tierList = band.tiers
        .map((id) => tiers[id])
        .sort((a, b) => (a.position < b.position ? -1 : 1))
        .map((t) => {
          if (t) {
            return { value: t.position, display: t.position };
          }
          return null;
        });

      return (
        <AddButton
          title={`Edit ${tier.name}`}
          image="images/edit.png"
          fields={[
            {
              label: 'Tier Name',
              name: 'name',
              type: 'input',
              required: true,
            },
            {
              label: 'Tier Position',
              name: 'position',
              type: 'select',
              options: tierList,
            },
          ]}
          onSubmit={(formValues) => editTier(formValues, tier.id)}
          initialValues={{ name: tier.name, position: tier.position }}
          form={`edit-tier-${tier.id}`}
          enableReinitialize={true}
        />
      );
    }
  };

  const renderDeleteButton = () => {
    if (authorized) {
      return (
        <DeleteButton
          onSubmit={() => deleteTier(tier.id)}
          displayName={tier.name}
        />
      );
    }
  };

  const renderTotalTime = () => {
    if (titlesToRender) {
      const total = titlesToRender.reduce((prev, cur) => {
        return prev + cur.selectedBounce?.duration;
      }, 0);

      if (!total) {
        return null;
      }

      const minutes = Math.floor(total / 60);
      const seconds =
        Math.floor(total % 60) < 10
          ? '0' + Math.floor(total % 60)
          : Math.floor(total % 60);
      return <div>{`${minutes}:${seconds}`}</div>;
    }
  };

  const renderOrderButton = () => {
    if (!tier.orderBy || tier.orderBy === 'date') {
      return (
        <div className="order-by">
          <div>Order titles by: </div>
          <div
            className="order-button order-active"
            onClick={(e) => e.stopPropagation()}
          >
            Date
          </div>
          <div
            className="order-button"
            onClick={(e) => {
              e.stopPropagation();
              setOrder(tier.id, 'name');
            }}
          >
            ABC
          </div>
        </div>
      );
    }

    if (tier.orderBy === 'name') {
      return (
        <div className="order-by">
          <div>Order titles by:</div>
          <div
            className="order-button"
            onClick={(e) => {
              e.stopPropagation();
              setOrder(tier.id, 'date');
            }}
          >
            Date
          </div>
          <div
            className="order-button order-active"
            onClick={(e) => e.stopPropagation()}
          >
            ABC
          </div>
        </div>
      );
    }
  };

  const renderOptions = () => {
    return (
      <>
        {renderAddButton()}
        {renderOrderButton()}
      </>
    );
  };

  const arrow = expand ? 'down-arrow' : '';
  const open = expand ? 'open' : 'closed';

  const renderTier = (drag = null) => {
    return (
      <>
        <div
          className={`row tier ${expand ? 'row-open' : ''}`}
          onClick={() => setExpand(!expand)}
        >
          <div className="marqee">
            <div className="tier-name">
              {drag && (
                <div
                  {...drag.dragHandleProps}
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src="images/drag-handle.svg"
                    alt="drag handle"
                    className="drag-handle"
                  />
                </div>
              )}
              <img
                className={`arrow ${arrow}`}
                src={`images/right-arrow.svg`}
                alt="tier arrow"
              />
              <h2>{tier.name}</h2>
            </div>
            <div className="tier-count">
              <div className="song-count">{tier.trackList.length} songs</div>
              <div className="song-count">{renderTotalTime()}</div>
            </div>
            <div className="tier-display">
              {renderEditButton()}
              {renderDeleteButton()}
            </div>
          </div>
        </div>
        <div className={`tier-options ${expand ? 'options-visible' : ''}`}>
          {expand && renderOptions()}
        </div>
        <hr />
        <div className={`title-container ${open}`}>
          {expand && titlesToRender && renderTitles()}
        </div>
      </>
    );
  };

  // check auth status to render draggable tiers

  if (authorized) {
    return (
      <Draggable draggableId={tier.id} index={tier.position - 1}>
        {(drag) => {
          return (
            <div {...drag.draggableProps} ref={drag.innerRef}>
              {renderTier(drag)}
            </div>
          );
        }}
      </Draggable>
    );
  } else {
    return renderTier();
  }
};

const mapStateToProps = (state) => {
  return {
    titles: state.titles,
    band: state.bands.currentBand,
    tiers: state.tiers,
  };
};

export default connect(mapStateToProps, {
  createTier,
  fetchTitles,
  editTier,
  deleteTier,
  setOrder,
})(requireAuth(Tier));
