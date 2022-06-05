import React, { useEffect, useState, useRef } from 'react';
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
  const [times, setTimes] = useState({});

  const orderedTitles = useRef({});

  useEffect(() => {
    setOrder(tier.id, 'date');
    fetchTitles(tier.id);
  }, [fetchTitles, setOrder, tier]);

  useEffect(() => {
    setTitlesToRender(tier.trackList.map((id) => titles[id]));
  }, [titles, tier]);

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
    if (!orderedTitles.current[title.id]) {
      orderedTitles.current[title.id] = new Date(bounce.date);
    }
  };

  const renderTitles = () => {
    const titleList = [...titlesToRender];

    if (!tier.orderBy || tier.orderBy === 'date') {
      titleList.sort((a, b) => {
        if (orderedTitles.current[a.id] && orderedTitles.current[b.id]) {
          if (orderedTitles.current[a.id] > orderedTitles.current[b.id]) {
            return -1;
          } else {
            return 1;
          }
        } else if (orderedTitles.current[a.id]) {
          return -1;
        } else if (orderedTitles.current[b.id]) {
          return 1;
        }
        return -1;
      });
    }

    if (tier.orderBy === 'name') {
      titleList.sort((a, b) => {
        return a.title < b.title ? -1 : 1;
      });
    }

    return titleList.map((title) => {
      if (title) {
        return (
          <Title
            title={title}
            tier={tier}
            key={title.id}
            getTime={getTime}
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
    const total = Object.values(times).reduce((prev, cur) => {
      return prev + cur;
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
  };

  const getTime = (track) => {
    if (times[track.id] !== track.duration) {
      setTimes({ ...times, [track.id]: track.duration });
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

  return (
    <Draggable draggableId={tier.id} index={tier.position - 1}>
      {(provided) => {
        return (
          <div {...provided.draggableProps} ref={provided.innerRef}>
            <div
              className={`row tier ${expand ? 'row-open' : ''}`}
              onClick={() => setExpand(!expand)}
            >
              <div className="marqee">
                <div className="tier-name">
                  <div
                    {...provided.dragHandleProps}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <img
                      src="images/drag-handle.svg"
                      alt="drag handle"
                      className="drag-handle"
                    />
                  </div>
                  <img
                    className={`arrow ${arrow}`}
                    src={`images/right-arrow.svg`}
                    alt="tier arrow"
                  />
                  <h2>{tier.name}</h2>
                </div>
                <div className="tier-count">
                  <div className="song-count">
                    {tier.trackList.length} songs
                  </div>
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
          </div>
        );
      }}
    </Draggable>
  );
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
